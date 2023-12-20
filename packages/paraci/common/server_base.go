package common

import (
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"sync"
	"time"
	"unsafe"

	restfulspec "github.com/emicklei/go-restful-openapi/v2"
	"github.com/emicklei/go-restful/v3"
	"github.com/google/uuid"
)

// enum StreamType
const (
	StreamTypeRead = iota
	StreamTypeWrite
	StreamTypeReadSeek
)

type StreamItem struct {
	r   io.Reader
	w   io.Writer
	rs  io.ReadSeeker
	typ int // enum StreamType
}

type ServerBase struct {
	mux         *http.ServeMux
	ws          *restful.WebService
	wsContainer *restful.Container
	key         []byte
	sLock       *sync.RWMutex
	streams     map[uuid.UUID]*StreamItem
}

func (s *ServerBase) Init(base string, key []byte) error {
	s.key = key
	s.mux = http.NewServeMux()

	s.ws = new(restful.WebService)
	s.ws.Path(base).Consumes(restful.MIME_JSON).Produces(restful.MIME_JSON)
	s.ws.Filter(func(r1 *restful.Request, r2 *restful.Response, fc *restful.FilterChain) {
		r2.AddHeader("Access-Control-Allow-Origin", "*")
		fc.ProcessFilter(r1, r2)
	})

	s.wsContainer = restful.NewContainer()
	s.wsContainer.ServeMux = s.mux
	s.wsContainer.Add(s.ws)

	return nil
}

func (s *ServerBase) Start(listen string) error {
	specConfig := restfulspec.Config{
		WebServices:                   s.wsContainer.RegisteredWebServices(),
		APIPath:                       "/apidocs.json",
		PostBuildSwaggerObjectHandler: nil}
	s.wsContainer.Add(restfulspec.NewOpenAPIService(specConfig))
	return http.ListenAndServe(listen, s.mux)
}

func (s *ServerBase) SigFilter(r1 *restful.Request, r2 *restful.Response, fc *restful.FilterChain) {
	err := s.CheckSignedRequest(r1)
	if err != nil {
		r2.WriteHeader(403)
		r2.Write([]byte(`unauthorized`))
		return
	}
	fc.ProcessFilter(r1, r2)
}

const signTimeDeltaThreshold = 5

func abs(a int64) int64 {
	if a < 0 {
		return -a
	}
	return a
}

func (s *ServerBase) CheckSignedRequest(req *restful.Request) error {
	if req == nil {
		return errors.New("nil request")
	}
	method := req.Request.Method
	endpoint := req.Request.URL.String()
	fullSignature := req.Request.Header.Get("X-ParaCI-Signature")
	if len(fullSignature) < 16 {
		return errors.New("invalid signature")
	}
	tStamp, err := hex.DecodeString(fullSignature[:16])
	if err != nil {
		return err
	}
	var tsRaw [8]byte = [8]byte{tStamp[0], tStamp[1], tStamp[2], tStamp[3],
		tStamp[4], tStamp[5], tStamp[6], tStamp[7]}
	sig := fullSignature[16:]
	ts := *(*int64)(unsafe.Pointer(&tsRaw))
	if abs(time.Now().Unix()-ts) > signTimeDeltaThreshold {
		return errors.New("signature expired")
	}
	if signRequest(s.key, ts, method, endpoint) != sig {
		return errors.New("invalid signature")
	}
	return nil
}

func (s *ServerBase) AddHandler(method string, endpoint string, handler interface{},
	filters ...restful.FilterFunction) {
	v := reflect.ValueOf(handler)
	t := v.Type()
	if t.Kind() != reflect.Func {
		panic(fmt.Sprintf("%v should be a function", handler))
	}
	if t.NumOut() > 2 || t.NumOut() < 1 {
		panic("a handler should have 1 or 2 return values")
	}
	var inputParams []string
	inNum := t.NumIn()
	var inType reflect.Type = nil
	for i := 0; i < t.NumIn(); i++ {
		curr := t.In(i)
		if curr.Kind() == reflect.String {
			inputParams = append(inputParams, curr.Name())
			continue
		}
		if i != t.NumIn()-1 {
			panic("a handler should have all string parameters except the last one")
		}
		inType = curr
	}
	errType := t.Out(t.NumOut() - 1)
	var err error
	if !errType.Implements(reflect.TypeOf(err)) {
		panic("a handler should return an error")
	}
	h := func(req *restful.Request, resp *restful.Response) {
		var finalErr error

		var in []reflect.Value
		for i, param := range inputParams {
			v, ok := req.PathParameters()[param]
			if !ok {
				v = req.QueryParameter(param)
			}
			in[i] = reflect.ValueOf(v)
		}
		if inType != nil {
			inLast := reflect.New(inType)
			err := req.ReadEntity(inLast)
			if err != nil {
				finalErr = err
			}
			in[inNum-1] = inLast
		}
		var out interface{} = nil
		if finalErr == nil {
			rslt := v.Call(in)
			if len(rslt) == 2 {
				finalErr = rslt[1].Interface().(error)
				out = rslt[0].Interface()
			} else {
				finalErr = rslt[0].Interface().(error)
			}
		}

		if finalErr != nil {
			if se, ok := finalErr.(*ServerError); ok {
				resp.WriteErrorString(se.Code(), se.Error())
			} else {
				resp.WriteErrorString(500, finalErr.Error())
			}
		}
		if out != nil {
			resp.WriteEntity(out)
		}
	}

	rt := s.ws.Method(method).Path(endpoint).To(h).
		Param(restful.HeaderParameter("X-ParaCI-Signature", "signature"))
	for _, param := range inputParams {
		rt = rt.Param(restful.PathParameter(param, param))
	}
	for _, f := range filters {
		rt = rt.Filter(f)
	}
	if inType != nil {
		rt = rt.Reads(reflect.New(inType).Interface())
	}
	if t.NumOut() == 2 {
		rt = rt.Returns(200, "success", reflect.New(t.Out(0)).Interface())
	}
	rt = rt.ReturnsError(500, "internal error", nil).
		ReturnsError(403, "access denied", nil).
		ReturnsError(400, "bad request", nil).
		ReturnsError(404, "not found", nil)
	s.ws.Route(rt)
}

func (s *ServerBase) AddRawHandler(method string, endpoint string,
	handler func(req *restful.Request, resp *restful.Response),
	filters ...restful.FilterFunction,
) {
	rt := s.ws.Method(method).Path(endpoint).To(handler).
		Param(restful.HeaderParameter("X-ParaCI-Signature", "signature"))
	for _, f := range filters {
		rt = rt.Filter(f)
	}
	rt = rt.ReturnsError(500, "internal error", nil).
		ReturnsError(403, "access denied", nil).
		ReturnsError(400, "bad request", nil).
		ReturnsError(404, "not found", nil)
	s.ws.Route(rt)
}

func (s *ServerBase) GetMux() *http.ServeMux {
	return s.mux
}

func (s *ServerBase) streamHandler(req *restful.Request, resp *restful.Response) {
	id, err := uuid.Parse(req.PathParameter("id"))
	if err != nil {
		resp.WriteError(400, err)
		return
	}
	s.sLock.RLock()
	st, ok := s.streams[id]
	s.sLock.RUnlock()
	if !ok {
		resp.WriteErrorString(404, "stream not found")
	}
	switch st.typ {
	case StreamTypeRead:
		// TODO: log
		io.Copy(resp.ResponseWriter, st.r)
	case StreamTypeWrite:
		// TODO: log
		io.Copy(st.w, req.Request.Body)
	case StreamTypeReadSeek:
		http.ServeContent(resp.ResponseWriter, req.Request, "attachment", time.Now(), st.rs)
	}
}

func (s *ServerBase) RegisterStream(id uuid.UUID, st *StreamItem) {
	s.sLock.Lock()
	defer s.sLock.Unlock()
	s.streams[id] = st
}

func (s *ServerBase) DeleteStream(id uuid.UUID) {
	s.sLock.Lock()
	defer s.sLock.Unlock()
	delete(s.streams, id)
}

type ServerError struct {
	code int
	err  error
}

func (se *ServerError) Error() string {
	return se.err.Error()
}

func (se *ServerError) Code() int {
	return se.code
}

func NewServerError(code int, err error) error {
	return &ServerError{
		code: code,
		err:  err,
	}
}

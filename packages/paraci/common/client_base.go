package common

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
	"unsafe"

	"github.com/cavaliergopher/grab/v3"
)

type AddrPool interface {
	Add(addr string)
	Has(addr string) bool
	Fail(addr string)
	Get() string
}

type AddrRRPool struct {
	lock  *sync.RWMutex
	addrs []string
	next  uint32
}

func NewAddrRRPool(addrs ...string) *AddrRRPool {
	return &AddrRRPool{
		lock:  &sync.RWMutex{},
		addrs: addrs,
	}
}

func (a *AddrRRPool) Add(addr string) {
	a.lock.Lock()
	defer a.lock.Unlock()
	a.addrs = append(a.addrs, addr)
}

func (a *AddrRRPool) Has(addr string) bool {
	a.lock.RLock()
	defer a.lock.RUnlock()
	for _, v := range a.addrs {
		if v == addr {
			return true
		}
	}
	return false
}

func (a *AddrRRPool) Fail(addr string) {
	a.lock.Lock()
	defer a.lock.Unlock()
	for i, v := range a.addrs {
		if v == addr {
			a.addrs = append(a.addrs[:i], a.addrs[i+1:]...)
		}
	}
}

func (a *AddrRRPool) Get() string {
	a.lock.RLock()
	defer a.lock.RUnlock()

	if len(a.addrs) == 0 {
		return ""
	}

	n := atomic.AddUint32(&a.next, 1)

	if int(n) > len(a.addrs) {
		atomic.StoreUint32(&a.next, 0)
		n = 1
	}
	return a.addrs[(int(n)-1)%len(a.addrs)]
}

type ClientBase struct {
	pool AddrPool
	key  []byte
	hc   *http.Client
}

func NewClientBase(pool AddrPool, key string, timeout time.Duration) *ClientBase {
	k, err := base64.StdEncoding.DecodeString(key)
	if err != nil {
		// TODO: better handling
		k = []byte(key)
	}
	return &ClientBase{
		pool: pool,
		key:  k,
		hc: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *ClientBase) GetPool() AddrPool {
	return c.pool
}

func signRequest(key []byte, now int64, method string, endpoint string) string {
	hasher := hmac.New(sha256.New, key)
	nowBytes := (*(*[8]byte)(unsafe.Pointer(&now)))[:]
	hasher.Write(nowBytes)
	hasher.Write([]byte(method))
	hasher.Write([]byte(endpoint))
	return hex.EncodeToString(nowBytes) +
		base64.StdEncoding.EncodeToString(hasher.Sum(nil))
}

func (c *ClientBase) SignRequest(method string, endpoint string) string {
	return signRequest(c.key, time.Now().UTC().Unix(), method, endpoint)
}

func (c *ClientBase) EndpointToURL(endpoint string) (string, error) {
	uri := c.pool.Get()
	if uri == "" {
		return "", fmt.Errorf("no available endpoint")
	}
	if uri[len(uri)-1] != '/' {
		uri += endpoint // endpoint should start with /
	} else {
		uri += endpoint[1:]
	}
	return uri, nil
}

func (c *ClientBase) Do(method string, endpoint string, body []byte) ([]byte, error) {
	uri, err := c.EndpointToURL(endpoint)
	if err != nil {
		return nil, err
	}
	var bodyBuf io.Reader
	if body != nil {
		bodyBuf = bytes.NewBuffer(body)
	} else {
		bodyBuf = nil
	}
	req, err := http.NewRequest(method, uri, bodyBuf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "paraci")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-ParaCI-Signature", c.SignRequest(method, endpoint))
	resp, err := c.hc.Do(req)
	if err != nil {
		// TODO: add fail mechanism
		return nil, err
	}
	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("bad response: %s: %s", resp.Status, b)
	}
	b, err := io.ReadAll(resp.Body)
	return b, err
}

func (c *ClientBase) DoStream(method string, endpoint string, body io.Reader) (*http.Response, error) {
	uri, err := c.EndpointToURL(endpoint)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest(method, uri, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "paraci")
	req.Header.Set("X-ParaCI-Signature", c.SignRequest(method, endpoint))
	return c.hc.Do(req)
}

func (c *ClientBase) Download(method string, endpoint string,
	body []byte, filepath string) (progress func() float64, wait func(), err error) {
	g := grab.NewClient()
	g.UserAgent = "paraci"
	g.HTTPClient = c.hc
	uri, err := c.EndpointToURL(endpoint)
	if err != nil {
		return nil, nil, err
	}
	req, err := grab.NewRequest(filepath, uri)
	if err != nil {
		return nil, nil, err
	}
	req.HTTPRequest.Body = io.NopCloser(bytes.NewBuffer(body))
	req.HTTPRequest.Header.Set("X-ParaCI-Signature", c.SignRequest(method, endpoint))
	resp := g.Do(req)
	if err := resp.Err(); err != nil {
		return nil, nil, err
	}
	return resp.Progress, resp.Wait, nil
}

func (c *ClientBase) Get(endpoint string, rslt interface{}) error {
	b, err := c.Do("GET", endpoint, nil)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, rslt)
}

func (c *ClientBase) Post(endpoint string, body interface{}, rslt interface{}) error {
	b, err := json.Marshal(body)
	if err != nil {
		return err
	}
	b, err = c.Do("POST", endpoint, b)
	if err != nil {
		return err
	}
	if rslt != nil {
		return json.Unmarshal(b, rslt)
	}
	return nil
}

func (c *ClientBase) Put(endpoint string, body interface{}, rslt interface{}) error {
	b, err := json.Marshal(body)
	if err != nil {
		return err
	}
	b, err = c.Do("PUT", endpoint, b)
	if err != nil {
		return err
	}
	if rslt != nil {
		return json.Unmarshal(b, rslt)
	}
	return nil
}

func (c *ClientBase) Delete(endpoint string, rslt interface{}) error {
	b, err := c.Do("DELETE", endpoint, nil)
	if err != nil {
		return err
	}
	if rslt != nil {
		return json.Unmarshal(b, rslt)
	}
	return nil
}

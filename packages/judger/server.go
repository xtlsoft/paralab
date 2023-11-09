package judger

import (
	"archive/tar"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"sync/atomic"
	"time"

	"github.com/lcpu-club/paralab/packages/judger/models"
	"github.com/lcpu-club/paralab/packages/judger/oss"
	"github.com/lcpu-club/paralab/packages/judger/scripting"
	"github.com/lcpu-club/paralab/packages/paraci/common"
	"gopkg.in/yaml.v2"
)

const jobsEndpoint = "/api/submission/jobs"

type Server struct {
	conf           *models.Configure
	cb             *common.ClientBase
	maxConcurrent  int32
	currConcurrent int32
	finChan        chan struct{}
}

func NewServer(conf *models.Configure) *Server {
	maxConcurrent := conf.MaxConcurrent
	if maxConcurrent <= 0 {
		maxConcurrent = runtime.NumCPU()
	}
	return &Server{
		conf: conf,
		cb: common.NewClientBase(common.NewAddrRRPool(conf.Pull.Servers...),
			conf.Pull.Key, 10*time.Second),
		maxConcurrent:  int32(maxConcurrent),
		currConcurrent: 0,
		finChan:        make(chan struct{}, maxConcurrent),
	}
}

func (s *Server) Start() error {
	err := oss.Connect(s.conf)
	if err != nil {
		return err
	}
	intervalUnit := int64(0)
	a := int64(s.conf.Interval.Max)
	b := int64(s.conf.Interval.Max - s.conf.Interval.Min)
	for {
		for atomic.LoadInt32(&s.currConcurrent) >= s.maxConcurrent {
			<-s.finChan
		}
		time.Sleep(time.Duration(a - b*(255-intervalUnit)*(255-intervalUnit)/(255*255)))

		msg, err := s.pull(int(s.maxConcurrent - atomic.LoadInt32(&s.currConcurrent)))
		if err != nil {
			log.Println(err) // TODO: better logging & dealing
		}
		if len(msg) == 0 {
			if intervalUnit < 0xFF {
				intervalUnit++
			}
			continue
		}
		intervalUnit = 0

		for _, m := range msg {
			go s.handleMsgWrapper(m)
			// NOTE(intlsy): The following line is a hotfix.
			// Here we wait for the goroutine to finish due to that the bizserver
			// does not mark a job as "running" when it is pulled (and I do not
			// have time for studying database locks).
			<-s.finChan
		}
	}
}

func (s *Server) pull(limit int) ([]*models.PullMessage, error) {
	rslt := []*models.PullMessage{}
	err := s.cb.Get(fmt.Sprintf("%s?limit=%v", jobsEndpoint, limit), &rslt)
	if err != nil {
		return nil, err
	}
	return rslt, nil
}

func (s *Server) PushResult(result *models.ResultMessage) error {
	return s.cb.Put(jobsEndpoint, result, nil)
}

func (s *Server) handleMsgWrapper(msg *models.PullMessage) {
	defer func() {
		err := recover()
		if err != nil {
			log.Println(err)
		}
	}()

	defer func() {
		atomic.AddInt32(&s.currConcurrent, -1)
		s.finChan <- struct{}{}
	}()

	err := s.handleMsg(msg)
	if err != nil {
		log.Println(err) // TODO: better logging & dealing
	}
}

func (s *Server) handleMsg(msg *models.PullMessage) error {
	// TODO: context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	// Pull problem from OSS
	problem := oss.NewProblem(msg.ProblemID)
	metaRaw, err := problem.GetMeta(ctx)
	if err != nil {
		return err
	}
	meta := &models.ProblemMeta{
		SolutionFiles: make(map[string]*models.SolutionFileMeta),
	}
	err = yaml.Unmarshal(metaRaw, meta)
	if err != nil {
		return err
	}

	wd, err := os.MkdirTemp(s.conf.TempDir, "paralab-judger")
	if err != nil {
		return err
	}

	// TODO: cache the problem
	sf, err := problem.GetScriptsTarballStream(ctx)
	if err != nil {
		return err
	}
	defer sf.Close()
	tr := tar.NewReader(sf)
	for {
		th, err := tr.Next()
		if err != nil {
			if err == io.EOF {
				break
			}
			return err
		}
		if th.Typeflag == tar.TypeDir {
			os.MkdirAll(filepath.Join(wd, th.Name), 0755)
			continue
		}
		outputFile, err := os.Create(
			filepath.Join(wd, th.Name),
		)
		if err != nil {
			return err
		}
		defer outputFile.Close()
		_, err = io.Copy(outputFile, tr)
		if err != nil {
			return err
		}
	}

	// Run the scripts
	scriptPath := filepath.Join(wd, meta.Entrance)
	scriptEngine, err := scripting.Engine(filepath.Ext(scriptPath))
	if err != nil {
		return err
	}
	code, err := os.ReadFile(scriptPath)
	if err != nil {
		return err
	}
	sCtx := scripting.NewScriptContext(s.PushResult, s.conf, msg.ID, msg, wd, meta)
	r, err := scriptEngine.Run(code, sCtx)

	if err != nil {
		return s.PushResult(&models.ResultMessage{
			ID:     msg.ID,
			Status: models.ResultStatusFailed,
			Result: &models.ResultBody{
				Error: err,
			},
		})
	}

	return s.PushResult(&models.ResultMessage{
		ID:     msg.ID,
		Status: models.ResultStatusCompleted,
		Result: r.Body,
	})
}

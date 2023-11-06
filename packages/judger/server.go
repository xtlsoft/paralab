package judger

import (
	"fmt"
	"log"
	"runtime"
	"sync/atomic"
	"time"

	"github.com/lcpu-club/paralab/packages/judger/models"
	"github.com/lcpu-club/paralab/packages/judger/oss"
	"github.com/lcpu-club/paralab/packages/paraci/common"
)

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
		}
	}
}

func (s *Server) pull(limit int) ([]*models.PullMessage, error) {
	rslt := []*models.PullMessage{}
	err := s.cb.Get(fmt.Sprintf("/api/v1/pull?limit=%v", limit), rslt)
	if err != nil {
		return nil, err
	}
	return rslt, nil
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
	// Pull problem from OSS

	// Run the script

	return nil
}

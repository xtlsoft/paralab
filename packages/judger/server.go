package judger

import (
	"fmt"
	"log"
	"time"

	"github.com/lcpu-club/paralab/packages/judger/models"
	"github.com/lcpu-club/paralab/packages/judger/oss"
	"github.com/lcpu-club/paralab/packages/paraci/common"
)

type Server struct {
	conf *models.Configure
	cb   *common.ClientBase
}

func NewServer(conf *models.Configure) *Server {
	return &Server{
		conf: conf,
		cb: common.NewClientBase(common.NewAddrRRPool(conf.Pull.Servers...),
			conf.Pull.Key, 10*time.Second),
	}
}

func (s *Server) Start() error {
	err := oss.Connect(s.conf)
	if err != nil {
		return err
	}
	for {
		msg, err := s.pull()
		if err != nil {
			log.Println(err) // TODO: better logging & dealing
		}
		if len(msg) == 0 {
			continue
		}
		// TODO: add as a configurable feature
		time.Sleep(5 * time.Second)
	}
	return nil
}

func (s *Server) pull() ([]*models.PullMessage, error) {
	// TODO: increase limit
	rslt := []*models.PullMessage{}
	err := s.cb.Get(fmt.Sprintf("/api/v1/pull?limit=%v", 1), rslt)
	if err != nil {
		return nil, err
	}
	return rslt, nil
}

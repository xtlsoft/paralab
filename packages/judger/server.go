package judger

import "github.com/lcpu-club/paralab/packages/judger/models"

type Server struct {
	conf *models.Configure
}

func NewServer(conf *models.Configure) *Server {
	return &Server{
		conf: conf,
	}
}

func (s *Server) Start() error {
	return nil
}

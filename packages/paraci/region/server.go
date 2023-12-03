package region

import (
	"github.com/lcpu-club/paralab/packages/paraci/common"
)

type Server struct {
	common.ServerBase
}

func NewServer() *Server {
	s := &Server{}
	return s
}

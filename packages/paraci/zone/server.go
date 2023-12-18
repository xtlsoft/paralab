package zone

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/lcpu-club/paralab/packages/paraci/common"
	"github.com/lcpu-club/paralab/packages/paraci/models"
	"gopkg.in/yaml.v3"
)

type Server struct {
	common.ServerBase
	conf *Configure
}

const baseURL = "/paraci/zone/v1/"

func NewServer(conf *Configure) (*Server, error) {
	s := &Server{
		conf: conf,
	}
	err := s.ServerBase.Init(baseURL, []byte(conf.Key))
	if err != nil {
		return nil, err
	}
	err = s.Init()
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Server) Init() error {
	// s.AddHandler("GET", "/ping", s.Ping, s.SigFilter)
	return nil
}

func (s *Server) Start() error {
	return s.ServerBase.Start(s.conf.Listen)
}

func (s *Server) HandlePostJob(req *PostJobRequest) (*PostJobResponse, error) {
	job := req.Job
	if job == nil {
		if req.JobYAML == "" {
			return nil, common.NewServerError(400, errors.New("job is empty"))
		}
		err := yaml.Unmarshal([]byte(req.JobYAML), &job)
		if err != nil {
			return nil, common.NewServerError(400, err)
		}
	}
	job.ID = uuid.Must(uuid.NewRandom())
	job.CreatedAt = time.Now()
	// TODO: push the job into the queue
	return &PostJobResponse{
		ID:        job.ID,
		CreatedAt: job.CreatedAt,
	}, nil
}

func (s *Server) HandleJobStatus(id uuid.UUID) (*models.Job, error) {
	return nil, nil
}

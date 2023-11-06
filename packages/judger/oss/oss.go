package oss

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/lcpu-club/paralab/packages/judger/models"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// Client is OSS client
var Client *minio.Client // TODO: more elegant way to handle this

var ProblemsBucket, SolutionsBucket string

func Connect(conf *models.Configure) error {
	m, err := minio.New(conf.OSS.Endpoint, &minio.Options{
		Creds: credentials.NewStaticV4(conf.OSS.AccessKey, conf.OSS.SecretKey, ""),
	})
	if err != nil {
		return err
	}
	Client = m
	ProblemsBucket = conf.OSS.Bucket.Problems
	SolutionsBucket = conf.OSS.Bucket.Solutions
	return nil
}

func FetchSolutionFile(ctx context.Context, key string) (*minio.Object, error) {
	obj, err := Client.GetObject(ctx, SolutionsBucket, key, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	return obj, nil
}

func FetchProblemFile(ctx context.Context, id int64, key string) (*minio.Object, error) {
	obj, err := Client.GetObject(ctx, ProblemsBucket,
		fmt.Sprintf("%d/%v", id, key), minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	return obj, nil
}

type Problem struct {
	id int64
}

func NewProblem(id int64) *Problem {
	return &Problem{id: id}
}

func (p *Problem) FetchFile(ctx context.Context, key string) (*minio.Object, error) {
	return FetchProblemFile(ctx, p.id, key)
}

func (p *Problem) FetchFileContent(ctx context.Context, key string) ([]byte, error) {
	obj, err := p.FetchFile(ctx, key)
	if err != nil {
		return nil, err
	}
	return io.ReadAll(obj)
}

func (p *Problem) GetMeta(ctx context.Context) ([]byte, error) {
	return p.FetchFileContent(ctx, "meta.yml")
}

func (p *Problem) GetScriptsTarballStream(ctx context.Context) (*minio.Object, error) {
	return p.FetchFile(ctx, "scripts.tar.gz")
}

func (p *Problem) GetModifiedTime(ctx context.Context) (time.Time, error) {
	t, err := p.FetchFileContent(ctx, "last_modified")
	if err != nil {
		return time.Time{}, err
	}
	return time.Parse(time.StampMilli, string(t))
}

func (p *Problem) ShouldUpdate(ctx context.Context) (bool, error) {
	t, err := p.GetModifiedTime(ctx)
	if err != nil {
		return false, err
	}
	return time.Since(t) < 0, nil
}

func (p *Problem) GetID() int64 {
	return p.id
}

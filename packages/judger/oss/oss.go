package oss

import (
	"github.com/lcpu-club/paralab/packages/judger/models"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// TODO: more elegant way to handle this
var Client *minio.Client

func Connect(conf *models.Configure) error {
	m, err := minio.New(conf.OSS.Endpoint, &minio.Options{
		Creds: credentials.NewStaticV4(conf.OSS.AccessKey, conf.OSS.SecretKey, ""),
	})
	if err != nil {
		return err
	}
	Client = m
	return nil
}

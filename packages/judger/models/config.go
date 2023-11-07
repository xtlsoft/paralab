package models

import (
	"time"
)

type Configure struct {
	Pull          *PullConfigure     `yaml:"pull"`
	OSS           *OSSConfigure      `yaml:"oss"`
	Interval      *IntervalConfigure `yaml:"interval"`
	MaxConcurrent int                `yaml:"max_concurrent"`
	TempDir       string             `yaml:"temp_dir"`
}

type PullConfigure struct {
	Servers []string `yaml:"servers"`
	Key     string   `yaml:"key"`
}

type OSSConfigure struct {
	Endpoint  string            `yaml:"endpoint"`
	AccessKey string            `yaml:"access_key"`
	SecretKey string            `yaml:"secret_key"`
	Buckets   *BucketsConfigure `yaml:"buckets"`
}

type BucketsConfigure struct {
	Problems  string `yaml:"problems"`
	Solutions string `yaml:"solutions"`
	Artifacts string `yaml:"artifacts"`
}

type IntervalConfigure struct {
	Min time.Duration `yaml:"min"`
	Max time.Duration `yaml:"max"`
}

package models

import (
	"time"
)

type Configure struct {
	Pull          *PullConfigure     `yaml:"pull"`
	OSS           *OSSConfigure      `yaml:"oss"`
	Interval      *IntervalConfigure `yaml:"interval"`
	MaxConcurrent int                `yaml:"max_concurrent"`
}

type PullConfigure struct {
	Servers []string `yaml:"servers"`
	Key     string   `yaml:"key"`
}

type OSSConfigure struct {
	Endpoint  string           `yaml:"endpoint"`
	AccessKey string           `yaml:"access_key"`
	SecretKey string           `yaml:"secret_key"`
	Bucket    *BucketConfigure `yaml:"bucket"`
}

type BucketConfigure struct {
	Problems  string `yaml:"problems"`
	Solutions string `yaml:"solutions"`
}

type IntervalConfigure struct {
	Min time.Duration `yaml:"min"`
	Max time.Duration `yaml:"max"`
}

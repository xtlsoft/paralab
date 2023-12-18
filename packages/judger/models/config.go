package models

import (
	"time"

	paraci_models "github.com/lcpu-club/paralab/packages/paraci/models"
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

type OSSConfigure paraci_models.OSSConfigure
type BucketsConfigure paraci_models.BucketsConfigure

type IntervalConfigure struct {
	Min time.Duration `yaml:"min"`
	Max time.Duration `yaml:"max"`
}

package models

import "time"

type OSSConfigure struct {
	Endpoint        string            `yaml:"endpoint" json:"endpoint"`
	AccessKey       string            `yaml:"access_key" json:"access_key"`
	SecretKey       string            `yaml:"secret_key" json:"secret_key"`
	Buckets         *BucketsConfigure `yaml:"buckets" json:"buckets"`
	PresignedExpiry time.Duration     `yaml:"presigned_expiry" json:"presigned_expiry"`
}

type BucketsConfigure struct {
	Problems  string `yaml:"problems"`
	Solutions string `yaml:"solutions"`
	Artifacts string `yaml:"artifacts"`
}

type NsqConfigure struct {
	Nsqd                    *NsqdConfigure       `yaml:"nsqd" json:"nsqd"`
	NsqLookupd              *NsqLookupdConfigure `yaml:"nsqlookupd" json:"nsqlookupd"`
	MaxAttempts             int                  `yaml:"max_attempts" json:"max_attempts"`
	RequeueDelay            time.Duration        `yaml:"requeue_delay" json:"requeue_delay"`
	MsgTimeout              time.Duration        `yaml:"msg_timeout" json:"msg_timeout"` // Minimum: 1s
	AuthSecret              string               `yaml:"auth_secret" json:"auth_secret"`
	RDYRedistributeInterval time.Duration        `yaml:"rdy_redistribute_interval" json:"rdy_redistribute_interval"`
	Concurrent              int                  `yaml:"concurrent" json:"concurrent"`
}

type NsqdConfigure struct {
	Address string `yaml:"address" json:"address"`
}

type NsqLookupdConfigure struct {
	Address []string `yaml:"address" json:"address"`
}

type EtcdConfigure struct {
	Endpoints []string `yaml:"endpoints" json:"endpoints"`
	Username  string   `yaml:"username" json:"username"`
	Password  string   `yaml:"password" json:"password"`
}

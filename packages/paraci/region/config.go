package region

import "github.com/lcpu-club/paralab/packages/paraci/models"

type Configure struct {
	Listen        string                `yaml:"listen" json:"listen"`
	Key           string                `yaml:"key" json:"key"`
	NsqConfigure  *models.NsqConfigure  `yaml:"nsq" json:"nsq"`
	EtcdConfigure *models.EtcdConfigure `yaml:"etcd" json:"etcd"`
}

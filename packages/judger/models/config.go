package models

type Configure struct {
	Pull *PullConfigure `yaml:"pull"`
	OSS  *OSSConfigure  `yaml:"oss"`
}

type PullConfigure struct {
	Servers []string `yaml:"servers"`
	Key     string   `yaml:"key"`
}

type OSSConfigure struct {
	Endpoint  string `yaml:"endpoint"`
	AccessKey string `yaml:"access_key"`
	SecretKey string `yaml:"secret_key"`
}

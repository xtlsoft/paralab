package models

type Container struct {
	Name    string            `yaml:"name"`
	Image   string            `yaml:"image"`
	Tag     string            `yaml:"tag"`
	Env     []string          `yaml:"env"`
	Ports   map[int]int       `yaml:"ports"`
	Volumes map[string]string `yaml:"volumes"`
	Network string            `yaml:"network"`
	CPU     string            `yaml:"cpu"`
	Memory  string            `yaml:"memory"`
	Storage string            `yaml:"storage"`
}

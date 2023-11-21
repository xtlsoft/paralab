package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gopkg.in/yaml.v3"
)

const (
	JobStatusQueued   = "queued"
	JobStatusRunning  = "running"
	JobStatusFinished = "finished"
	JobStatusFailed   = "failed"
)

type QueuedJob struct {
	Job
	Status    string            `json:"status" yaml:"status"`
	QueueTime time.Time         `json:"queue_time" yaml:"queue_time"`
	Vars      map[string]string `json:"vars" yaml:"vars"`
}

// Job is a job description
type Job struct {
	ID        uuid.UUID  `json:"id" yaml:"id"`
	Region    string     `json:"region" yaml:"region"` // Currently only single region supported
	Steps     []*JobStep `json:"steps" yaml:"steps"`
	CreatedAt time.Time  `json:"created_at" yaml:"created_at"`
}

type JobStep struct {
	Name      string            `json:"name" yaml:"name"`
	When      []string          `json:"when" yaml:"when"`
	Count     int               `json:"count" yaml:"count"` // Node count
	Image     string            `json:"image" yaml:"image"`
	Parallel  []*JobStep        `json:"parallel" yaml:"parallel"`
	Placement *JobStepPlacement `json:"placement" yaml:"placement"`
	Resources *JobStepResources `json:"resources" yaml:"resources"`
	Volumes   []*JobStepVolume  `json:"volumes" yaml:"volumes"`
	Envs      map[string]string `json:"envs" yaml:"envs"`
	Vars      []string          `json:"vars" yaml:"vars"`
	Commands  []*JobStepCommand `json:"commands" yaml:"commands"`
	WorkDir   string            `json:"work_dir,omitempty" yaml:"work_dir,omitempty"`
}

type JobStepVolume struct {
	Name   string `json:"name" yaml:"name"`
	Path   string `json:"path" yaml:"path"`
	Shared bool   `json:"shared" yaml:"shared"` // Default: false
	Cached bool   `json:"cached" yaml:"cached"` // Default: false
}

type JobStepCommand struct {
	Exec         string   `json:"exec,omitempty" yaml:"exec,omitempty"`
	Arguments    []string `json:"args,omitempty" yaml:"args,omitempty"`
	Shell        string   `json:"shell,omitempty" yaml:"shell,omitempty"`
	Count        int      `json:"count,omitempty" yaml:"count,omitempty"`                     // Default: 1
	NProcPerNode int      `json:"n_proc_per_node,omitempty" yaml:"n_proc_per_node,omitempty"` // Default: 1
	WorkDir      string   `json:"work_dir,omitempty" yaml:"work_dir,omitempty"`
}

type JobStepPlacement struct {
	Or  []*JobStepPlacement `json:"or" yaml:"or"`
	And []*JobStepPlacement `json:"and" yaml:"and"`
	Not []*JobStepPlacement `json:"not" yaml:"not"`

	Partition string   `json:"partition" yaml:"partition"`
	Tags      []string `json:"tags" yaml:"tags"`
}

type JobStepResources struct {
	CPU    *CPUConfigure   `json:"cpu" yaml:"cpu"`
	Memory MemorySize      `json:"memory" yaml:"memory"`
	GPU    []*GPUConfigure `json:"gpu" yaml:"gpu"`
}

type CPUConfigure struct {
	Sockets        int `json:"sockets" yaml:"sockets"`
	CoresPerSocket int `json:"cores_per_socket" yaml:"cores_per_socket"`
	ThreadsPerCore int `json:"threads_per_core" yaml:"threads_per_core"`
	Count          int `json:"count" yaml:"count"`
}

type GPUConfigure struct {
	Type  string   `json:"type" yaml:"type"`
	Tags  []string `json:"tags" yaml:"tags"` // like "cuda", "rocm"...
	Count int      `json:"count" yaml:"count"`
}

type MemorySize int64 // Stores kilobytes

func (ms MemorySize) String() string {
	if ms < 1024 {
		return fmt.Sprintf("%dK", ms)
	}
	if ms < 1024*1024 {
		return fmt.Sprintf("%.2fM", float64(ms)/1024)
	}
	if ms < 1024*1024*1024 {
		return fmt.Sprintf("%.2fG", float64(ms)/1024/1024)
	}
	return fmt.Sprintf("%.2fT", float64(ms)/1024/1024/1024)
}

func (ms *MemorySize) UnmarshalYAML(value *yaml.Node) error {
	var s string
	if err := value.Decode(&s); err != nil {
		return err
	}
	var v float64
	var u string
	if _, err := fmt.Sscanf(s, "%f%s", &v, &u); err != nil {
		return err
	}
	switch u {
	case "K":
		*ms = MemorySize(v * 1024)
	case "M":
		*ms = MemorySize(v * 1024 * 1024)
	case "G":
		*ms = MemorySize(v * 1024 * 1024 * 1024)
	case "T":
		*ms = MemorySize(v * 1024 * 1024 * 1024 * 1024)
	default:
		return fmt.Errorf("invalid memory unit: %s", u)
	}
	return nil
}

func (ms *MemorySize) UnmarshalJSON(data []byte) error {
	return ms.UnmarshalYAML(&yaml.Node{Value: string(data)})
}

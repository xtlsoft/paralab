package zone

import (
	"time"

	"github.com/google/uuid"
	"github.com/lcpu-club/paralab/packages/paraci/models"
)

type PostJobRequest struct {
	Job     *models.Job `yaml:"job,omitempty" json:"job,omitempty"`
	JobYAML string      `json:"job_yaml,omitempty"`
}

type PostJobResponse struct {
	ID        uuid.UUID `json:"id"`
	CreatedAt time.Time `json:"created_at"`
}

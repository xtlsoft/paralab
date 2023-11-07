package scripting

import "github.com/lcpu-club/paralab/packages/judger/models"

type ScriptResult struct {
	Body   *models.ResultBody     `json:"body,omitempty"`
	Output string                 `json:"output,omitempty"`
	Extra  map[string]interface{} `json:"extra,omitempty"`
}

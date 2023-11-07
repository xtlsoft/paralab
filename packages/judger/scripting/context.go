package scripting

import "github.com/lcpu-club/paralab/packages/judger/models"

type ScriptContext struct {
	JobID       int64
	PullMessage *models.PullMessage
	Conf        *models.Configure
	Wd          string
	Meta        *models.ProblemMeta
	Artifacts   map[string]string
	ResultFunc  func(result *models.ResultMessage) error
}

func NewScriptContext(
	result func(result *models.ResultMessage) error, conf *models.Configure, id int64, msg *models.PullMessage,
	wd string, meta *models.ProblemMeta,
) *ScriptContext {
	return &ScriptContext{ResultFunc: result, Conf: conf, JobID: id, PullMessage: msg, Wd: wd, Meta: meta}
}

func (c *ScriptContext) BuildResult() *ScriptResult {
	return &ScriptResult{}
}

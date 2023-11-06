package scripting

import "github.com/lcpu-club/paralab/packages/judger/models"

type ScriptContext struct {
	conf *models.Configure
	wd   string
}

func NewScriptContext(conf *models.Configure, wd string) *ScriptContext {
	return &ScriptContext{conf: conf, wd: wd}
}

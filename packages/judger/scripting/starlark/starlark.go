package starlark

import (
	"bytes"
	"strconv"

	"github.com/lcpu-club/paralab/packages/judger/scripting"
	star "go.starlark.net/starlark"
)

type StarlarkEngine struct {
	rslt   *scripting.ScriptResult
	output bytes.Buffer
	ctx    *scripting.ScriptContext
}

func NewStarlarkEngine() scripting.ScriptEngine {
	return &StarlarkEngine{
		output: *bytes.NewBuffer([]byte{}),
		rslt:   &scripting.ScriptResult{},
	}
}

func (e *StarlarkEngine) GetName() string {
	return "starlark"
}

func (e *StarlarkEngine) GetExtensionName() string {
	return ".star"
}

func (e *StarlarkEngine) Run(code []byte, ctx *scripting.ScriptContext) (*scripting.ScriptResult, error) {
	e.ctx = ctx
	thread := &star.Thread{
		Name:  "judge",
		Print: e.print,
	}
	env := e.declareEnvs()
	_, err := star.ExecFile(thread, ctx.Meta.Entrance, code, env)
	e.rslt.Output = e.output.String()
	return e.rslt, err
}

type StarlarkFn func(thread *star.Thread, fn *star.Builtin, args star.Tuple, kwArgs []star.Tuple) (star.Value, error)

func (e *StarlarkEngine) declareEnvs() star.StringDict {
	env := star.StringDict{
		"job_id": star.String(strconv.FormatInt(e.ctx.JobID, 10)),
	}

	addFn := func(n string, f StarlarkFn) {
		env[n] = star.NewBuiltin(n, f)
	}

	addFn("read_solution", e.readSolution)
	addFn("read_script", e.readScript)
	addFn("result", e.result)
	addFn("sleep", e.sleep)

	addFn("run_user_code", e.runUserCode)

	return env
}

func init() {
	scripting.RegisterEngine(func() scripting.ScriptEngine {
		return NewStarlarkEngine()
	})
}

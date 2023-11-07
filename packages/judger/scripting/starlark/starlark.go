package starlark

import (
	"bytes"
	"strconv"

	"github.com/lcpu-club/paralab/packages/judger/scripting"
	"go.starlark.net/starlark"
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
	return "star"
}

func (e *StarlarkEngine) Run(code []byte, ctx *scripting.ScriptContext) (*scripting.ScriptResult, error) {
	e.ctx = ctx
	thread := &starlark.Thread{
		Name:  "judge",
		Print: e.print,
	}
	env := e.declareEnvs()
	_, err := starlark.ExecFile(thread, ctx.Meta.Entrance, code, env)
	e.rslt.Output = e.output.String()
	return e.rslt, err
}

type StarlarkFn func(thread *starlark.Thread, fn *starlark.Builtin, args starlark.Tuple, kwArgs []starlark.Tuple) (starlark.Value, error)

func (e *StarlarkEngine) declareEnvs() starlark.StringDict {
	env := starlark.StringDict{
		"job_id": starlark.String(strconv.FormatInt(e.ctx.JobID, 10)),
	}

	addFn := func(n string, f StarlarkFn) {
		env[n] = starlark.NewBuiltin(n, f)
	}

	addFn("read_solution", e.readSolution)
	addFn("read_script", e.readScript)
	addFn("result", e.result)

	return env
}

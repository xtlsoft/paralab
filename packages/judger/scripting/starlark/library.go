package starlark

import (
	"context"
	"errors"
	"os"
	"time"
	"path/filepath"

	"github.com/lcpu-club/paralab/packages/judger/models"
	"github.com/lcpu-club/paralab/packages/judger/oss"
	star "go.starlark.net/starlark"
)

func (e *StarlarkEngine) print(_ *star.Thread, msg string) {
	e.output.WriteString(msg)
}

func (e *StarlarkEngine) readScript(
	thread *star.Thread,
	b *star.Builtin,
	args star.Tuple,
	kwArgs []star.Tuple,
) (star.Value, error) {
	var name string
	if err := star.UnpackArgs(b.Name(), args, kwArgs, "name", &name); err != nil {
		return nil, err
	}
	fName := filepath.Join(e.ctx.Wd, name)
	fContent, err := os.ReadFile(fName)
	if err != nil {
		return nil, err
	}
	return star.String(fContent), nil
}

func (e *StarlarkEngine) readSolution(
	thread *star.Thread,
	b *star.Builtin,
	args star.Tuple,
	kwArgs []star.Tuple,
) (star.Value, error) {
	var name string
	if err := star.UnpackArgs(b.Name(), args, kwArgs, "name", &name); err != nil {
		return nil, err
	}
	k, ok := e.ctx.PullMessage.Solution[name]
	if !ok {
		return nil, errors.New("solution not found")
	}
	s, err := oss.FetchSolutionFileContent(context.Background(), k)
	if err != nil {
		return nil, err
	}
	return star.String(s), nil
}

func (e *StarlarkEngine) result(
	thread *star.Thread,
	b *star.Builtin,
	args star.Tuple,
	kwArgs []star.Tuple,
) (star.Value, error) {
	var score int
	var status string
	var extra = &star.Dict{}
	if err := star.UnpackArgs(b.Name(), args, kwArgs, "score", &score, "status", &status, "extra", &extra); err != nil {
		return nil, err
	}
	if e.rslt.Body == nil {
		e.rslt.Body = &models.ResultBody{}
	}
	e.rslt.Body.Score = score
	e.rslt.Body.Status = status
	var ok bool
	e.rslt.Body.Extra, ok = starlarkValToGoVal(extra).(map[string]interface{})
	if !ok {
		return nil, errors.New("invalid extra")
	}
	err := e.ctx.ResultFunc(&models.ResultMessage{
		ID:     e.ctx.JobID,
		Status: models.ResultStatusRunning,
		Result: e.rslt.Body,
	})
	if err != nil {
		return nil, err
	}
	return star.None, nil
}

func starlarkValToGoVal(val star.Value) interface{} {
	switch val.Type() {
	case "bool":
		return bool(val.(star.Bool))
	case "int":
		x, ok := val.(star.Int).Int64()
		if !ok {
			return val.(star.Int).BigInt()
		}
		return x
	case "float":
		return float64(val.(star.Float))
	case "string":
		return string(val.(star.String))
	case "dict":
		d := val.(*star.Dict)
		r := make(map[string]interface{})
		for _, k := range d.Keys() {
			m, ok, err := d.Get(k)
			if !ok || err != nil {
				continue
			}
			r[k.String()] = starlarkValToGoVal(m)
		}
		return r
	case "list":
		l := val.(*star.List)
		r := make([]interface{}, l.Len())
		for i := 0; i < l.Len(); i++ {
			r[i] = starlarkValToGoVal(l.Index(i))
		}
		return r
	default:
		return nil
	}
}

func (e *StarlarkEngine) sleep(
	thread *star.Thread,
	b *star.Builtin,
	args star.Tuple,
	kwArgs []star.Tuple,
) (star.Value, error) {
	var seconds int
	if err := star.UnpackArgs(b.Name(), args, kwArgs, "seconds", &seconds); err != nil {
		return nil, err
	}
	time.Sleep(time.Duration(seconds) * time.Second)
	return star.None, nil
}

package starlark

import (
	"io"
	"os"
	"os/exec"

	star "go.starlark.net/starlark"
)

func (e *StarlarkEngine) runUserCode( // TODO: this is just a mock
	thread *star.Thread,
	b *star.Builtin,
	args star.Tuple,
	kwArgs []star.Tuple,
) (star.Value, error) {
	var code, lang, input string
	if err := star.UnpackArgs(b.Name(), args, kwArgs, "code", &code, "lang?", &lang, "input?", &input); err != nil {
		return nil, err
	}
	tmpCode, err := os.CreateTemp(e.ctx.Conf.TempDir, "code*.cpp")
	if err != nil {
		return star.None, err
	}
	defer os.Remove(tmpCode.Name())
	_, err = tmpCode.Write([]byte(code))
	tmpCode.Close()
	if err != nil {
		return star.None, err
	}
	tmpBin, err := os.CreateTemp(e.ctx.Conf.TempDir, "bin")
	if err != nil {
		return star.None, err
	}
	tmpBin.Close()
	defer os.Remove(tmpBin.Name())
	err = exec.Command("/usr/bin/g++", "-o", tmpBin.Name(), tmpCode.Name()).Run()
	if err != nil {
		return star.None, err
	}
	cmd := exec.Command(tmpBin.Name())
	inPipe, err := cmd.StdinPipe()
	if err != nil {
		return star.None, err
	}
	outPipe, err := cmd.StdoutPipe()
	if err != nil {
		return star.None, err
	}
	err = cmd.Start()
	if err != nil {
		return star.None, err
	}
	_, err = inPipe.Write([]byte(input))
	if err != nil {
		return star.None, err
	}
	bys, err := io.ReadAll(outPipe)
	if err != nil {
		return star.None, err
	}
	err = cmd.Wait()
	if err != nil {
		return star.None, err
	}
	return star.String(bys), nil
}

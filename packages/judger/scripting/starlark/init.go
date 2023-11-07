package starlark

import "github.com/lcpu-club/paralab/packages/judger/scripting"

func init() {
	scripting.RegisterEngine(NewStarlarkEngine)
}

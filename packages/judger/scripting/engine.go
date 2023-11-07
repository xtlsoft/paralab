package scripting

import "errors"

var scriptEngines = make(map[string](func() ScriptEngine))

type ScriptEngine interface {
	GetName() string
	GetExtensionName() string
	Run(code []byte, ctx *ScriptContext) (*ScriptResult, error)
}

func RegisterEngine(engine func() ScriptEngine) {
	scriptEngines[engine().GetExtensionName()] = engine
}

func RemoveEngine(extensionName string) {
	delete(scriptEngines, extensionName)
}

var ErrUnsupportedScriptEngine = errors.New("unsupported script engine")

func Engine(extensionName string) (ScriptEngine, error) {
	engine, ok := scriptEngines[extensionName]
	if !ok {
		return nil, ErrUnsupportedScriptEngine
	}
	return engine(), nil
}

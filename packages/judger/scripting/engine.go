package scripting

var scriptEngines = make(map[string]ScriptEngine)

type ScriptEngine interface {
	GetName() string
	GetExtensionName() string
	Run(code []byte, ctx *ScriptContext) (*ScriptResult, error)
}

func RegisterEngine(engine ScriptEngine) {
	scriptEngines[engine.GetExtensionName()] = engine
}

func RemoveEngine(extensionName string) {
	delete(scriptEngines, extensionName)
}

func Engine(extensionName string) ScriptEngine {
	return scriptEngines[extensionName]
}

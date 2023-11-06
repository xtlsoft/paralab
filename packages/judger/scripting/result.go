package scripting

type ScriptResult struct {
	Error   error                  `json:"error,omitempty"`
	Mark    int                    `json:"mark"`
	Message string                 `json:"message,omitempty"`
	Extra   map[string]interface{} `json:"extra,omitempty"`
}

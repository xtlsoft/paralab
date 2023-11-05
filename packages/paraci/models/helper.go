package models

type HelperInitInstruction struct {
	Shell    string                                  `json:"h,omitempty" yaml:"shell"`
	Services map[string]HelperInitInstructionService `json:"s,omitempty" yaml:"services"`
	// Commands will be run sequentially
	Commands []HelperInitInstructionCommand `json:"c,omitempty" yaml:"commands"`
	// Execve runs after all commands finishes running
	Execve HelperInitInstructionCommand `json:"v,omitempty" yaml:"execve"`
	// ExternalConfigures will be loaded before running commands,
	// both files and directories are supported
	ExternalConfigures []string `json:"e,omitempty" yaml:"external_configures"`
}

const (
	HelperInitInstructionServiceRestartAlways    = "always"
	HelperInitInstructionServiceRestartOnFailure = "on_failure"
	HelperInitInstructionServiceRestartNever     = "never"
)

type HelperInitInstructionService struct {
	Shell    string   `json:"h,omitempty" yaml:"shell"`
	Requires []string `json:"r,omitempty" yaml:"requires"`
	// Provides will provide its own name by default, virtual targets
	// are supported, requiring a virtual target will require all the
	// services in the target
	Provides      []string `json:"p,omitempty" yaml:"provides"`
	NoProvideSelf bool     `json:"np,omitempty" yaml:"no_provide_self"`
	// Includes loads external configures before running commands
	Includes []string `json:"i,omitempty" yaml:"includes"`
	// Restart is instance of enum HelperInitInstructionServiceRestart
	Restart string `json:"s,omitempty" yaml:"restart"`
	// Wait determines whether to wait for this command to complete
	Wait bool `json:"w,omitempty" yaml:"wait"`
	// Waits declares other services to be waited before start
	Waits []string `json:"ws,omitempty" yaml:"waits"`
	// Commands will be run sequentially
	Commands []HelperInitInstructionCommand `json:"c,omitempty" yaml:"commands"`
	WorkDir  string                         `json:"d,omitempty" yaml:"workdir"`
}

type HelperInitInstructionCommand struct {
	Command string `json:"c,omitempty" yaml:"command,omitempty"`
	// Target defaults to "this", can be "or" or node list separated by commas
	Target    string   `json:"t,omitempty" yaml:"target,omitempty"`
	Execute   string   `json:"e,omitempty" yaml:"execute,omitempty"`
	Arguments []string `json:"a,omitempty" yaml:"arguments,omitempty"`
	Service   string   `json:"s,omitempty" yaml:"service,omitempty"`
}

package helper

import "os"

var shellCandidates = []string{
	"/bin/bash",
	"/bin/sh",
	"/bin/ash",
	"/bin/zsh",
	"/usr/bin/bash",
	"/usr/bin/sh",
	"/usr/bin/ash",
	"/usr/bin/zsh",
	"/bin/busybox",
}

var shell = ""

func determineShell() string {
	if shell != "" {
		return shell
	}
	shell = os.Getenv("SHELL")
	if shell == "" {
		for _, candidate := range shellCandidates {
			if _, err := os.Stat(candidate); err == nil {
				shell = candidate
				break
			}
		}
		os.Setenv("SHELL", shell)
	}
	if shell == "" {
		panic("cannot determine shell")
	}
	return shell
}

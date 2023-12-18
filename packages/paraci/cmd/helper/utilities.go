package main

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

func determineShell() string {
	shell := os.Getenv("SHELL")
	if shell == "" {
		for _, candidate := range shellCandidates {
			if _, err := os.Stat(candidate); err == nil {
				return candidate
			}
		}
	}
	return shell
}

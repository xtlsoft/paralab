package helper

import (
	"os"

	"github.com/urfave/cli/v2"
)

func HandleInit(ctx *cli.Context) error {
	determineShell()
	os.Environ()
	return nil
}

func ParseInstruction() error {
	return nil
}

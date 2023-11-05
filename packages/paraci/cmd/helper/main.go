// Command paraci-helper provides a helper binary used in
// container instances to interact with paraci
package main

import (
	"log"
	"os"

	"github.com/lcpu-club/paralab/packages/paraci/helper"
	"github.com/lcpu-club/paralab/packages/paraci/version"
	"github.com/urfave/cli/v2"
)

func main() {
	app := cli.NewApp()
	app.Name = "paraci-helper"
	app.Usage = "Helper utility for interacting with paraci"
	app.Version = version.Version
	app.Authors = []*cli.Author{}
	for _, author := range version.Authors {
		app.Authors = append(app.Authors, &cli.Author{Name: author[0], Email: author[1]})
	}
	app.Commands = append(app.Commands, &cli.Command{
		Name:        "init",
		Aliases:     []string{"i"},
		Description: "Act as PID 1",
		Action:      helper.HandleInit,
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "instruction",
				Aliases: []string{"i"},
				EnvVars: []string{"PARACI_HELPER_INSTRUCTION"},
			},
		},
	})
	err := app.Run(os.Args)
	if err != nil {
		log.Fatalln(err)
	}
}

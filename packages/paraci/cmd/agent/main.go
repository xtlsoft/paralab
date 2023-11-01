// The Agent runs a container following the instructions of a Paracifile
// and reports the results back to the Paraci server.
package main

import (
	"log"
	"os"

	"github.com/lcpu-club/paralab/packages/paraci/common/version"
	"github.com/urfave/cli/v2"
)

func main() {
	app := cli.NewApp()
	app.Name = "paraci-agent"
	app.Usage = "Paraci Agent is a container runner for Paraci"
	app.Version = version.Version
	app.Authors = []*cli.Author{}
	for _, author := range version.Authors {
		app.Authors = append(app.Authors, &cli.Author{Name: author[0], Email: author[1]})
	}
	// TODO: add commands
	err := app.Run(os.Args)
	if err != nil {
		log.Fatalln(err)
	}
}

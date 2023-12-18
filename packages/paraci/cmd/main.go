// Command paraci provides a brand-new CI service for highly parallel scenarios
package main

import (
	"log"
	"os"

	"github.com/lcpu-club/paralab/packages/paraci/version"
	"github.com/urfave/cli/v2"
)

func main() {
	app := cli.NewApp()
	app.Name = "paraci"
	app.Usage = "A brand-new CI service for highly parallel scenarios"
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

// Command judger provides a highly customizable judging
// service for paralab platform
package main

import (
	"log"
	"os"

	"github.com/lcpu-club/paralab/packages/judger"
	"github.com/lcpu-club/paralab/packages/judger/models"
	"github.com/urfave/cli/v2"
	"gopkg.in/yaml.v3"
)

func main() {
	app := cli.NewApp()
	app.Name = "paralab-judger"
	app.Usage = "A brand-new Judger service for HPC scenarios"
	app.Version = "0.0.1"

	app.Commands = []*cli.Command{
		{
			Name:  "start",
			Usage: "Start paralab judger",
			Flags: []cli.Flag{
				&cli.StringFlag{
					Name:        "config",
					Aliases:     []string{"conf", "c"},
					Usage:       "Configure file path",
					DefaultText: "/etc/paralab/judger.yml",
					Value:       "/etc/paralab/judger.yml",
				},
			},
			Action: func(ctx *cli.Context) error {
				confRaw, err := os.ReadFile(ctx.String("config"))
				if err != nil {
					return err
				}
				conf := &models.Configure{
					Pull:     &models.PullConfigure{},
					OSS:      &models.OSSConfigure{},
					Interval: &models.IntervalConfigure{},
				}
				err = yaml.Unmarshal(confRaw, conf)
				if err != nil {
					return err
				}
				judger := judger.NewServer(conf)
				return judger.Start()
			},
		},
	}

	err := app.Run(os.Args)
	if err != nil {
		log.Fatalln(err)
	}
}

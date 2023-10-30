module github.com/lcpu-club/paralab/packages/paraci

go 1.18

replace (
	github.com/lcpu-club/paralab/packages/bizserver v0.0.0 => ../bizserver
	github.com/lcpu-club/paralab/packages/judger v0.0.0 => ../judger
)

require github.com/urfave/cli/v2 v2.25.7 // direct

require (
	github.com/dotenv-org/godotenvvault v0.6.0
	github.com/gorilla/mux v1.8.0
)

require (
	github.com/cpuguy83/go-md2man/v2 v2.0.2 // indirect
	github.com/emicklei/go-restful/v3 v3.11.0 // indirect
	github.com/joho/godotenv v1.5.1 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/modern-go/concurrent v0.0.0-20180228061459-e0a39a4cb421 // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/xrash/smetrics v0.0.0-20201216005158-039620a65673 // indirect
)

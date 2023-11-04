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
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/containerd/console v1.0.3 // indirect
	github.com/containerd/go-runc v1.1.0 // indirect
	github.com/containers/image/v5 v5.28.0 // indirect
	github.com/containers/libtrust v0.0.0-20230121012942-c1716e8a8d01 // indirect
	github.com/containers/ocicrypt v1.1.8 // indirect
	github.com/containers/storage v1.50.1 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.2 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/docker/docker v24.0.6+incompatible // indirect
	github.com/emicklei/go-restful/v3 v3.11.0 // indirect
	github.com/google/uuid v1.4.0 // indirect
	github.com/joho/godotenv v1.5.1 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/opencontainers/go-digest v1.0.0 // indirect
	github.com/opencontainers/image-spec v1.1.0-rc4 // indirect
	github.com/opencontainers/runtime-spec v1.1.0 // indirect
	github.com/redis/go-redis/v9 v9.3.0 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/sirupsen/logrus v1.9.3 // indirect
	github.com/xrash/smetrics v0.0.0-20201216005158-039620a65673 // indirect
	golang.org/x/exp v0.0.0-20230817173708-d852ddb80c63 // indirect
	golang.org/x/sys v0.12.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

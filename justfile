# ------------------------------------------------------------------------------
# This is justfile. It contains all the tool commands required to develop
# this project.
#
# To run scripts here, you need to have just, Golang, node, Python and PHP installed
# on your machine. You must also have standard bash.
# ------------------------------------------------------------------------------

VERSION := "0.0.1"

# The default target to be run by just.
default: greet tidy-gomod build-paraci

greet:
  @echo "paralab development tool -- version {{VERSION}}"
  @echo "  - kernel:   $(uname -a | awk '{ print $3 }')"
  @echo "  - os/arch:  $(go version | awk '{print $4}')"
  @echo "  - branch:   $(git branch)"
  @echo "  - versions:"
  @echo "    - node:   $(node --version | sed 's/v//')"
  @echo "    - golang: $(go version | awk '{ print $3 }' | sed 's/go//')"
  @echo ""

# Run `go mod tidy` for all packages
tidy-gomod:
  @echo "=> Tidying gomod..."
  cd packages/paraci && go mod tidy && cd ../..
  cd packages/bizserver && go mod tidy && cd ../..
  cd packages/judger && go mod tidy && cd ../..

build-paraci-helper:
  @echo "=> Building paraci-helper..."
  @# CGO_ENABLED is set to 0 to avoid dynamic linking glibc/musl to avoid compatibility issues
  @# on alpine or openwrt.
  CGO_ENABLED=0 go build -o ./packages/paraci/dist/paraci-helper ./packages/paraci/cmd/helper

build-paraci: build-paraci-helper
  @echo "=> Building paraci..."
  mkdir -p packages/paraci/dist
  go build -o packages/paraci/dist/paraci github.com/lcpu-club/paralab/packages/paraci/cmd

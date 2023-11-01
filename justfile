# ------------------------------------------------------------------------------
# This is justfile. It contains all the tool commands required to develop
# this project.
#
# To run scripts here, you need to have just, Golang, node, Python and PHP installed
# on your machine. You must also have standard bash.
# ------------------------------------------------------------------------------

VERSION := "0.0.1"

# The default target to be run by just.
default: greet

greet:
  @echo "paralab development tool -- version {{VERSION}}"
  @echo "  - kernel:   $(uname -a | awk '{ print $3 }')"
  @echo "  - os/arch:  $(go version | awk '{print $4}')"
  @echo "  - branch:   $(git branch)"
  @echo "  - versions:"
  @echo "    - node:   $(node --version | sed 's/v//')"
  @echo "    - golang: $(go version | awk '{ print $3 }' | sed 's/go//')"
  @echo ""

# ParaCI Build

ci-build: ci-build-agent
    
mkdir-dist:
    mkdir -p dist

ci-build-agent: mkdir-dist
    go build -o dist/paraci-agent github.com/lcpu-club/paralab/packages/paraci/cmd/agent

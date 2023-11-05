# ParaCI development guide

## Set up environment for Paraci development

## Golang and Just

Paraci is written in [Golang](https://golang.org/). You can install it from [here](https://golang.org/doc/install).

Paraci uses [Just](https://just.systems/) to work as a task runner. You can install it from `cargo install just`.

## Build Paraci

Go version must >= 1.19

Install dependencies
``` bash
sudo apt install libgpgme-dev libbtrfs-dev libdevmapper-dev
```

Build common binaries
``` bash
just build
```
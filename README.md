# Paralab

Paralab is a brand new HPC compete and play platform. It provides a full-featured cloud-native CI (Continuous Integration) module which is compatible with existing HPC ecosystem (e.g. Slurm). It also provides a web-based IDE (Integrated Development Environment) for users to develop and debug their codes. Paralab is designed to be a platform for HPC users to compete and play with each other. It is also a platform for HPC researchers to develop and test their new ideas.

## Features

- **Cloud-native CI**: Paralab provides a full-featured cloud-native CI module which is compatible with existing HPC ecosystem (e.g. Slurm). It supports both static and dynamic analysis. It also supports both unit test and integration test. It can be easily integrated with existing CI tools (e.g. Jenkins, Gitlab CI, etc.) to provide a better CI experience for HPC users.
- **Web-based IDE**: Paralab provides a web-based IDE for users to develop and debug their codes. It supports both C/C++ and Fortran. It also supports both serial and parallel programs. It can be easily integrated with existing IDEs (e.g. VSCode, Eclipse, etc.) to provide a better IDE experience for HPC users.
- **Compete and play**: Paralab is designed to be a platform for HPC users to compete and play with each other. It is also a platform for HPC researchers to develop and test their new ideas.

## About this Monorepo

This is the monorepo of Paralab. It contains the following sub-projects:

- ui
- bizserver
- judger
- paraci

## Development

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/download/)
- [Golang](https://golang.org/doc/install)
- [Etcd](https://etcd.io)
- [MinIO](https://min.io/download)
- [nsq](https://nsq.io/deployment/installing.html)
- [Just](https://just.systems)

### Start PostgreSQL and Redis

We've prepares a docker compose file for you to start PostgreSQL and Redis in one click. You can start them by running the following command under the root directory of this monorepo:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts a PostgreSQL instance and a Redis instance. You can use the following command to stop them:

```bash
docker-compose -f docker-compose.dev.yml down
```

### Launch the Bizserver

If you are launching the bizserver for the first time, you need to copy the `.env.example` file to `.env` and modify the environment variables in it.

To start the bizserver, navigate to the `bizserver` directory and run the following command:

```bash
set -o allexport && source ../../.env && set +o allexport	# This exports the environment variables in the .env file. Copied from https://stackoverflow.com/a/30969768/16569836
npm run start:dev
```

### Launch the UI

Navigate to `packages/ui` and run the following command:

```bash
export PROXY_BIZSERVER_ADDR=http://localhost:3000	# This sets the address of the bizserver. All requests to /api will be redirected to http://localhost:3000/api. You can change it to your own bizserver address.
npm run dev
```

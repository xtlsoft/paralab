FROM golang:1.21.3-bullseye

RUN mkdir /app && mkdir /source
WORKDIR /app

ENV HOMT=/root

COPY . /source
COPY .env /app/.env

# add libgpgme-dev
RUN sed -ri.bak -e 's/\/\/.*?(deb.debian.org|mirrors.*?)\/debian/\/\/mirrors.pku.edu.cn\/debian/g' /etc/apt/sources.list && \
    apt-get update && apt-get install -y \
    libgpgme-dev build-essential curl git libbtrfs-dev libdevmapper-dev \
    && rm -rf /var/lib/apt/lists/* \
    && cd /source \
    && go mod tidy \
    && go build -o /app/paraci github.com/lcpu-club/paralab/packages/paraci/cmd \
    && cd /app

CMD ["/app/paraci", "agent"]

# do noting, will docker exec into it
# CMD ["tail", "-f", "/dev/null"]
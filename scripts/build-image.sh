#!/bin/bash

SPLIIT_APP_NAME=$(node -p -e "require('./package.json').name")
SPLIIT_VERSION=$(node -p -e "require('./package.json').version")

docker buildx build \
    --platform "linux/arm64" \
    --load \
    -t "${SPLIIT_APP_NAME}:${SPLIIT_VERSION}" \
    -t "${SPLIIT_APP_NAME}:latest" \
    .

docker image prune -f

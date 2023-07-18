#!/bin/bash
docker build \
  --platform linux/amd64 \
  . \
  --tag "gravitywiz/circleci-node-for-wp:latest"

docker push gravitywiz/circleci-node-for-wp:latest

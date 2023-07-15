#!/bin/bash
CYPRESS_VERSION=$1

MAJOR=`echo $CYPRESS_VERSION | cut -d. -f1`

test -n "$CYPRESS_VERSION" || { echo "CYPRESS_VERSION not set"; exit 1; }

docker build \
  --platform linux/amd64 \
  --build-arg CYPRESS_VERSION=$CYPRESS_VERSION \
  . \
  --tag "gravitywiz/cypress-with-wp-php8.1:$CYPRESS_VERSION" \
  --tag "gravitywiz/cypress-with-wp-php8.1:$MAJOR" \
  --tag "gravitywiz/cypress-with-wp-php8.1:latest" # Remove me if building an older version

docker push gravitywiz/cypress-with-wp:$CYPRESS_VERSION
docker push gravitywiz/cypress-with-wp:$MAJOR
docker push gravitywiz/cypress-with-wp:latest

#!/usr/bin/env bash
set -e

echo "Starting"

if [ "$1" = "" ]; then
  docker compose run --rm ng-mocks npm run build:dev && \
    docker compose run --rm ng-mocks npm run s:e2e && \
    docker compose run --rm ng-mocks npm run s:test:e2e && \
    docker compose run --rm ng-mocks npm run s:app:e2e
fi

if [ "$1" = "" ] || [ "$1" = "root" ]; then
  docker compose run --rm ng-mocks npm run test
fi

if [ "$1" = "coverage" ]; then
  docker compose run --rm -e WITH_COVERAGE=1 ng-mocks npm run test
fi

#!/usr/bin/env bash
set -e

if [ "$1" != "coverage" ] && [ "$1" != "root" ]; then
  docker compose run --rm ng-mocks npm run build:dev
fi

if [ "$1" = "" ] || [ "$1" = "root" ]; then
  docker compose run --rm ng-mocks npm run test
fi

if [ "$1" = "coverage" ]; then
  docker compose run --rm -e WITH_COVERAGE=1 ng-mocks npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a17" ]; then
  docker compose run --rm ng-mocks npm run s:a17 && \
    docker compose run --rm ng-mocks npm run s:test:a17 && \
    docker compose run --rm ng-mocks npm run s:app:a17 && \
    docker compose run --rm a17 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a18" ]; then
  docker compose run --rm ng-mocks npm run s:a18 && \
    docker compose run --rm ng-mocks npm run s:test:a18 && \
    docker compose run --rm ng-mocks npm run s:app:a18 && \
    docker compose run --rm a18 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a19" ]; then
  docker compose run --rm ng-mocks npm run s:a19 && \
    docker compose run --rm ng-mocks npm run s:test:a19 && \
    docker compose run --rm ng-mocks npm run s:app:a19 && \
    docker compose run --rm a19 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a20" ]; then
  docker compose run --rm ng-mocks npm run s:a20 && \
    docker compose run --rm ng-mocks npm run s:test:a20 && \
    docker compose run --rm ng-mocks npm run s:app:a20 && \
    docker compose run --rm a20 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a21" ]; then
  docker compose run --rm ng-mocks npm run s:a21 && \
    docker compose run --rm ng-mocks npm run s:test:a21 && \
    docker compose run --rm ng-mocks npm run s:app:a21 && \
    docker compose run --rm a21 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "jasmine" ]; then
  docker compose run --rm ng-mocks npm run s:jasmine && \
    docker compose run --rm ng-mocks npm run s:app:jasmine && \
    docker compose run --rm jasmine npm run test
fi

if [ "$1" = "" ] || [ "$1" = "jest" ]; then
  docker compose run --rm ng-mocks npm run s:jest && \
    docker compose run --rm ng-mocks npm run s:app:jest && \
    docker compose run --rm jest npm run test
fi

if [ "$1" = "" ] || [ "$1" = "min" ]; then
  docker compose run --rm ng-mocks npm run s:min && \
    docker compose run --rm ng-mocks npm run s:app:min && \
    docker compose run --rm min npm run test
fi

if [ "$1" = "" ] || [ "$1" = "nx" ]; then
  docker compose run --rm ng-mocks npm run s:nx && \
    docker compose run --rm ng-mocks npm run s:test:nx && \
    docker compose run --rm ng-mocks npm run s:app:nx && \
    docker compose run --rm nx npm run test
fi

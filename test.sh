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

if [ "$1" = "" ] || [ "$1" = "a5" ] || [ "$1" = "a5es5" ]; then
  docker compose run --rm ng-mocks npm run s:a5es5 && \
    docker compose run --rm ng-mocks npm run s:test:a5es5 && \
    docker compose run --rm ng-mocks npm run s:app:a5es5 && \
    docker compose run --rm a5es5 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a5" ] || [ "$1" = "a5es2015" ]; then
  docker compose run --rm ng-mocks npm run s:a5es2015 && \
    docker compose run --rm ng-mocks npm run s:test:a5es2015 && \
    docker compose run --rm ng-mocks npm run s:app:a5es2015 && \
    docker compose run --rm a5es2015 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a6" ]; then
  docker compose run --rm ng-mocks npm run s:a6 && \
    docker compose run --rm ng-mocks npm run s:test:a6 && \
    docker compose run --rm ng-mocks npm run s:app:a6 && \
    docker compose run --rm a6 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a7" ]; then
  docker compose run --rm ng-mocks npm run s:a7 && \
    docker compose run --rm ng-mocks npm run s:test:a7 && \
    docker compose run --rm ng-mocks npm run s:app:a7 && \
    docker compose run --rm a7 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a8" ]; then
  docker compose run --rm ng-mocks npm run s:a8 && \
    docker compose run --rm ng-mocks npm run s:test:a8 && \
    docker compose run --rm ng-mocks npm run s:app:a8 && \
    docker compose run --rm a8 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a9" ]; then
  docker compose run --rm ng-mocks npm run s:a9 && \
    docker compose run --rm ng-mocks npm run s:test:a9 && \
    docker compose run --rm ng-mocks npm run s:app:a9 && \
    docker compose run --rm a9 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a10" ]; then
  docker compose run --rm ng-mocks npm run s:a10 && \
    docker compose run --rm ng-mocks npm run s:test:a10 && \
    docker compose run --rm ng-mocks npm run s:app:a10 && \
    docker compose run --rm a10 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a11" ]; then
  docker compose run --rm ng-mocks npm run s:a11 && \
    docker compose run --rm ng-mocks npm run s:test:a11 && \
    docker compose run --rm ng-mocks npm run s:app:a11 && \
    docker compose run --rm a11 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a12" ]; then
  docker compose run --rm ng-mocks npm run s:a12 && \
    docker compose run --rm ng-mocks npm run s:test:a12 && \
    docker compose run --rm ng-mocks npm run s:app:a12 && \
    docker compose run --rm a12 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a13" ]; then
  docker compose run --rm ng-mocks npm run s:a13 && \
    docker compose run --rm ng-mocks npm run s:test:a13 && \
    docker compose run --rm ng-mocks npm run s:app:a13 && \
    docker compose run --rm a13 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a14" ]; then
  docker compose run --rm ng-mocks npm run s:a14 && \
    docker compose run --rm ng-mocks npm run s:test:a14 && \
    docker compose run --rm ng-mocks npm run s:app:a14 && \
    docker compose run --rm a14 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a15" ]; then
  docker compose run --rm ng-mocks npm run s:a15 && \
    docker compose run --rm ng-mocks npm run s:test:a15 && \
    docker compose run --rm ng-mocks npm run s:app:a15 && \
    docker compose run --rm a15 npm run test
fi

if [ "$1" = "" ] || [ "$1" = "a16" ]; then
  docker compose run --rm ng-mocks npm run s:a16 && \
    docker compose run --rm ng-mocks npm run s:test:a16 && \
    docker compose run --rm ng-mocks npm run s:app:a16 && \
    docker compose run --rm a16 npm run test
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

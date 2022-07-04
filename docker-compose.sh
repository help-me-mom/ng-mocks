#!/usr/bin/env bash

echo "Starting" && \
  docker-compose up -- ng-mocks && \
  docker-compose up -- docs && \
  docker-compose up -- e2e && \
  docker-compose up -- a5es5 && \
  docker-compose up -- a5es2015 && \
  docker-compose up -- a6 && \
  docker-compose up -- a7 && \
  docker-compose up -- a8 && \
  docker-compose up -- a9 && \
  docker-compose up -- a10 && \
  docker-compose up -- a11 && \
  docker-compose up -- a12 && \
  docker-compose up -- a13 && \
  docker-compose up -- a14 && \
  docker-compose down

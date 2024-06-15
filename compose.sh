#!/usr/bin/env bash
set -e

echo "Starting"

export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"

if [ "$1" = "" ] || [ "$1" = "root" ]; then
  docker compose up --build -- ng-mocks && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs
fi

if [ "$1" = "" ] || [ "$1" = "docs" ]; then
  docker compose up --build -- docs && \
    cd ./docs && \
    nvm install && \
    nvm use && \
    cd ..
fi

if [ "$1" = "" ] || [ "$1" = "e2e" ]; then
  docker compose up --build -- e2e && \
    cd ./tests-e2e && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ..
fi

if [ "$1" = "" ] || [ "$1" = "a5" ] || [ "$1" = "a5es5" ]; then
  docker compose up --build -- a5es5 && \
    cd ./e2e/a5es5 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    node ./node_modules/node-sass/scripts/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a5" ] || [ "$1" = "a5es2015" ]; then
  docker compose up --build -- a5es2015 && \
    cd ./e2e/a5es2015 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    node ./node_modules/node-sass/scripts/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a6" ]; then
  docker compose up --build -- a6 && \
    cd ./e2e/a6 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    node ./node_modules/node-sass/scripts/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a7" ]; then
  docker compose up --build -- a7 && \
    cd ./e2e/a7 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a8" ]; then
  docker compose up --build -- a8 && \
    cd ./e2e/a8 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a9" ]; then
  docker compose up --build -- a9 && \
    cd ./e2e/a9 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a10" ]; then
  docker compose up --build -- a10 && \
    cd ./e2e/a10 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a11" ]; then
  docker compose up --build -- a11 && \
    cd ./e2e/a11 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a12" ]; then
  docker compose up --build -- a12 && \
    cd ./e2e/a12 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a13" ]; then
  docker compose up --build -- a13 && \
    cd ./e2e/a13 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a14" ]; then
  docker compose up --build -- a14 && \
    cd ./e2e/a14 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a15" ]; then
  docker compose up --build -- a15 && \
    cd ./e2e/a15 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a16" ]; then
  docker compose up --build -- a16 && \
    cd ./e2e/a16 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/lib/esm/puppeteer/node/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a17" ]; then
  docker compose up --build -- a17 && \
    cd ./e2e/a17 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a18" ]; then
  docker compose up --build -- a18 && \
    cd ./e2e/a18 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "jasmine" ]; then
  docker compose up --build -- jasmine && \
    cd ./e2e/jasmine && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "jest" ]; then
  docker compose up --build -- jest
fi

if [ "$1" = "" ] || [ "$1" = "min" ]; then
  docker compose up --build -- min && \
    cd ./e2e/min && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "nx" ]; then
  docker compose up --build -- nx
fi

if [ "$1" = "" ]; then
  docker compose down --remove-orphans
fi

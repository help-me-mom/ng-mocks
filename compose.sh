#!/usr/bin/env bash
set -e

export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"

if [ "$1" = "" ] || [ "$1" = "root" ]; then
  docker compose up --build -- ng-mocks && \
    docker compose run --rm ng-mocks node ./node_modules/puppeteer/install.mjs && \
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
    docker compose run --rm e2e node ./node_modules/puppeteer/install.mjs && \
    cd ./tests-e2e && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ..
fi

if [ "$1" = "" ] || [ "$1" = "a5" ] || [ "$1" = "a5es5" ]; then
  docker compose up --build -- a5es5 && \
    docker compose run --rm a5es5 node ./node_modules/puppeteer/install.js && \
    docker compose run --rm a5es5 node ./node_modules/node-sass/scripts/install.js && \
    cd ./e2e/a5es5 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    node ./node_modules/node-sass/scripts/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a5" ] || [ "$1" = "a5es2015" ]; then
  docker compose up --build -- a5es2015 && \
    docker compose run --rm a5es2015 node ./node_modules/puppeteer/install.js && \
    docker compose run --rm a5es2015 node ./node_modules/node-sass/scripts/install.js && \
    cd ./e2e/a5es2015 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    node ./node_modules/node-sass/scripts/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a6" ]; then
  docker compose up --build -- a6 && \
    docker compose run --rm a6 node ./node_modules/puppeteer/install.js && \
    docker compose run --rm a6 node ./node_modules/node-sass/scripts/install.js && \
    cd ./e2e/a6 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    node ./node_modules/node-sass/scripts/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a7" ]; then
  docker compose up --build -- a7 && \
    docker compose run --rm a7 node ./node_modules/puppeteer/install.js && \
    cd ./e2e/a7 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a8" ]; then
  docker compose up --build -- a8 && \
    docker compose run --rm a8 node ./node_modules/puppeteer/install.js && \
    cd ./e2e/a8 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a9" ]; then
  docker compose up --build -- a9 && \
    docker compose run --rm a9 node ./node_modules/puppeteer/install.js && \
    cd ./e2e/a9 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a10" ]; then
  docker compose up --build -- a10 && \
    docker compose run --rm a10 node ./node_modules/puppeteer/install.js && \
    cd ./e2e/a10 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a11" ]; then
  docker compose up --build -- a11 && \
    docker compose run --rm a11 node ./node_modules/puppeteer/install.js && \
    cd ./e2e/a11 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a12" ]; then
  docker compose up --build -- a12 && \
    docker compose run --rm a12 node ./node_modules/puppeteer/install.js && \
    cd ./e2e/a12 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a13" ]; then
  docker compose up --build -- a13 && \
    docker compose run --rm a13 node ./node_modules/puppeteer/install.js && \
    cd ./e2e/a13 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a14" ]; then
  docker compose up --build -- a14 && \
    docker compose run --rm a14 node ./node_modules/puppeteer/install.js && \
    cd ./e2e/a14 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a15" ]; then
  docker compose up --build -- a15 && \
    docker compose run --rm a15 node ./node_modules/puppeteer/install.js && \
    cd ./e2e/a15 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a16" ]; then
  docker compose up --build -- a16 && \
    docker compose run --rm a16 node ./node_modules/puppeteer/lib/esm/puppeteer/node/install.js && \
    cd ./e2e/a16 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/lib/esm/puppeteer/node/install.js && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a17" ]; then
  docker compose up --build -- a17 && \
    docker compose run --rm a17 node ./node_modules/puppeteer/install.mjs && \
    cd ./e2e/a17 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a18" ]; then
  docker compose up --build -- a18 && \
    docker compose run --rm a18 node ./node_modules/puppeteer/install.mjs && \
    cd ./e2e/a18 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a19" ]; then
  docker compose up --build -- a19 && \
    docker compose run --rm a19 node ./node_modules/puppeteer/install.mjs && \
    cd ./e2e/a19 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a20" ]; then
  docker compose up --build -- a20 && \
    docker compose run --rm a20 node ./node_modules/puppeteer/install.mjs && \
    cd ./e2e/a20 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "a21" ]; then
  docker compose up --build -- a21 && \
    docker compose run --rm a21 node ./node_modules/puppeteer/install.mjs && \
    cd ./e2e/a21 && \
    nvm install && \
    nvm use && \
    node ./node_modules/puppeteer/install.mjs && \
    cd ../..
fi

if [ "$1" = "" ] || [ "$1" = "jasmine" ]; then
  docker compose up --build -- jasmine && \
    docker compose run --rm jasmine node ./node_modules/puppeteer/install.mjs && \
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
    docker compose run --rm min node ./node_modules/puppeteer/install.mjs && \
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

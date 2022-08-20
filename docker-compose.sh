#!/usr/bin/env bash
set -e

echo "Starting"

export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"

docker-compose up -- ng-mocks && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js

docker-compose up -- docs

docker-compose up -- e2e && \
  cd ./tests-e2e && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ..

docker-compose up -- a5es5 && \
  cd ./e2e/a5es5 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- a5es2015 && \
  cd ./e2e/a5es2015 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- a6 && \
  cd ./e2e/a6 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- a7 && \
  cd ./e2e/a7 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- a8 && \
  cd ./e2e/a8 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- a9 && \
  cd ./e2e/a9 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- a10 && \
  cd ./e2e/a10 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- a11 && \
  cd ./e2e/a11 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- a12 && \
  cd ./e2e/a12 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- a13 && \
  cd ./e2e/a13 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- a14 && \
  cd ./e2e/a14 && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- jasmine && \
  cd ./e2e/jasmine && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- jest

docker-compose up -- min && \
  cd ./e2e/min && \
  nvm install && \
  nvm use && \
  node ./node_modules/puppeteer/install.js && \
  cd ../..

docker-compose up -- nx

#/bin/sh

set -e

cd examples/angular2
npm run dev:ci:phantomjs

cd ../angularjs
npm run dev:ci:phantomjs

cd ../mocha
npm run dev:ci:phantomjs

cd ../typescript-1.6.2
npm run dev:ci:phantomjs

cd ../typescript-latest
npm run dev:ci:phantomjs

cd ../../tests/integration-1.8.10
npm run dev:ci:phantomjs
npm run dev:ci:phantomjs:angular2
npm run dev:ci:phantomjs:react

cd ../integration-latest
npm run dev:ci:phantomjs
npm run dev:ci:phantomjs:angular2
npm run dev:ci:phantomjs:core
npm run dev:ci:phantomjs:emptyfile
npm run dev:ci:phantomjs:no-module
npm run dev:ci:phantomjs:react

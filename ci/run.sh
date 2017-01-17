#/bin/sh

set -e

cd example-project
npm run dev:ci

cd ../example-project\@1.6.2
npm run dev:ci

cd ../example-project\@angular2
npm run dev:ci

cd ../example-project\@angularjs
npm run dev:ci

cd ../example-project\@mocha
npm run dev:ci

cd ../integration-tests\@1.8.10
npm run dev:ci
npm run dev:ci:angular2
npm run dev:ci:react

cd ../integration-tests\@latest
npm run dev:ci
npm run dev:ci:angular2
npm run dev:ci:core
npm run dev:ci:emptyfile
npm run dev:ci:no-module
npm run dev:ci:react

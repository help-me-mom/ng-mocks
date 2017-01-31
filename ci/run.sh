#/bin/sh

set -e

cd example-project
npm run dev:ci:phantomjs

cd ../example-project\@1.6.2
npm run dev:ci:phantomjs

cd ../example-project\@angular2
npm run dev:ci:phantomjs

cd ../example-project\@angularjs
npm run dev:ci:phantomjs

cd ../example-project\@mocha
npm run dev:ci:phantomjs

cd ../integration-tests\@1.8.10
npm run dev:ci:phantomjs
npm run dev:ci:phantomjs:angular2
npm run dev:ci:phantomjs:react

cd ../integration-tests\@latest
npm run dev:ci:phantomjs
npm run dev:ci:phantomjs:angular2
npm run dev:ci:phantomjs:core
npm run dev:ci:phantomjs:emptyfile
npm run dev:ci:phantomjs:no-module
npm run dev:ci:phantomjs:react

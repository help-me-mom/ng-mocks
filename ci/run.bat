cd example-project
call npm run dev:ci

cd ..\example-project@1.6.2
call npm run dev:ci

cd ..\example-project@angular2
call npm run dev:ci

cd ..\example-project@angularjs
call npm run dev:ci

cd ..\example-project@mocha
call npm run dev:ci

cd ..\integration-tests@1.8.10
call npm run dev:ci
call npm run dev:ci:angular2
call npm run dev:ci:react

cd ..\integration-tests@latest
call npm run dev:ci
call npm run dev:ci:angular2
call npm run dev:ci:core
call npm run dev:ci:emptyfile
call npm run dev:ci:no-module
call npm run dev:ci:react

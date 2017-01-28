cd example-project
call npm run dev:ci || exit /b

cd ..\example-project@1.6.2
call npm run dev:ci || exit /b

cd ..\example-project@angular2
call npm run dev:ci || exit /b

cd ..\example-project@angularjs
call npm run dev:ci || exit /b

cd ..\example-project@mocha
call npm run dev:ci || exit /b

cd ..\integration-tests@1.8.10
call npm run dev:ci || exit /b
call npm run dev:ci:angular2 || exit /b
call npm run dev:ci:react || exit /b

cd ..\integration-tests@latest
call npm run dev:ci || exit /b
call npm run dev:ci:angular2 || exit /b
call npm run dev:ci:core || exit /b
call npm run dev:ci:emptyfile || exit /b
call npm run dev:ci:no-module || exit /b
call npm run dev:ci:react || exit /b

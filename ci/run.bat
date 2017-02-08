cd examples\angular2
call npm run dev:ci || exit /b

cd ..\angularjs
call npm run dev:ci || exit /b

cd ..\mocha
call npm run dev:ci || exit /b

cd ..\typescript-1.6.2
call npm run dev:ci || exit /b

cd ..\typescript-latest
call npm run dev:ci || exit /b

cd ..\..\tests\integration-1.8.10
call npm run dev:ci || exit /b
call npm run dev:ci:angular2 || exit /b
call npm run dev:ci:react || exit /b

cd ..\integration-latest
call npm run dev:ci || exit /b
call npm run dev:ci:angular2 || exit /b
call npm run dev:ci:core || exit /b
call npm run dev:ci:emptyfile || exit /b
call npm run dev:ci:no-module || exit /b
call npm run dev:ci:react || exit /b

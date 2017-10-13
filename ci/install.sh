#/bin/sh

echo "npm -v"
npm -v

cd examples/angular2
pwd
npm i

cd ../angularjs
pwd
npm i

cd ../gulp
pwd
npm i

cd ../mocha
pwd
npm i

cd ../typescript-1.6.2
pwd
npm i

cd ../typescript-latest
pwd
npm i

cd ../../tests/integration-1.8.10
pwd
npm i

cd ../integration-latest
pwd
npm i
npm run prepare

cd ../..
pwd
npm i

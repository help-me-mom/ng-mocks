#/bin/sh

cd ..
rm -rf node_modules/
rm -rf examples/angular2/coverage/ examples/angular2/node_modules/
rm -rf examples/angularjs/coverage/ examples/angularjs/node_modules/
rm -rf examples/gulp/node_modules/ examples/gulp/src/bar/coverage/ examples/gulp/src/foo/coverage/
rm -rf examples/mocha/coverage/ examples/mocha/node_modules/
rm -rf examples/typescript-1.6.2/coverage/ examples/typescript-1.6.2/node_modules/
rm -rf examples/typescript-latest/coverage/ examples/typescript-latest/node_modules/
rm -rf tests/integration-1.8.10/coverage/ tests/integration-1.8.10/node_modules/
rm -rf tests/integration-latest/coverage/ tests/integration-latest/node_modules/

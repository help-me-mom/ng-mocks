#/bin/sh

echo "Cleaning dist"
rm -rf dist/

echo "Cleaning node_modules/"
rm -rf node_modules/

echo "Cleaning examples/angular2/"
rm -rf examples/angular2/coverage/ examples/angular2/node_modules/

echo "Cleaning examples/angularjs/"
rm -rf examples/angularjs/coverage/ examples/angularjs/node_modules/

echo "Cleaning examples/gulp/"
rm -rf examples/gulp/node_modules/ examples/gulp/src/bar/coverage/ examples/gulp/src/foo/coverage/

echo "Cleaning examples/mocha/"
rm -rf examples/mocha/coverage/ examples/mocha/node_modules/

echo "Cleaning examples/typescript-1.6.2/"
rm -rf examples/typescript-1.6.2/coverage/ examples/typescript-1.6.2/node_modules/

echo "Cleaning examples/typescript-1.8.10/"
rm -rf examples/typescript-1.8.10/coverage/ examples/typescript-1.8.10/node_modules/

echo "Cleaning examples/typescript-latest/"
rm -rf examples/typescript-latest/coverage/ examples/typescript-latest/node_modules/

echo "Cleaning tests/integration-latest/"
rm -rf tests/integration-latest/coverage/ tests/integration-latest/node_modules/

echo "Done"
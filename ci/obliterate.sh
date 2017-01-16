#/bin/sh

cd ..
rm -rf node_modules/
rm -rf example-project/coverage/ example-project/node_modules/
rm -rf example-project\@1.6.2/coverage/ example-project\@1.6.2/node_modules/
rm -rf example-project\@angular2/coverage/ example-project\@angular2/node_modules/
rm -rf example-project\@angularjs/coverage/ example-project\@angularjs/node_modules/
rm -rf example-project\@mocha/coverage/ example-project\@mocha/node_modules/
rm -rf integration-tests\@1.8.10/coverage/ integration-tests\@1.8.10/node_modules/
rm -rf integration-tests\@gulp/node_modules/ integration-tests\@gulp/src/bar/coverage/ integration-tests\@gulp/src/foo/coverage/
rm -rf integration-tests\@latest/coverage/ integration-tests\@latest/node_modules/

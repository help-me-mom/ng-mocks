# Integration tests for Typescript@latest

This project contains integration tests that uses the `karma-typescript` plugin itself to test the its functionality. The project is a 'living' project: the intention is that it should keep up with the latest version of Typescript and new tests should be added to it describing bug fixes or new features.

## Developing
After making changes to the source code or a test, and before running any tests, `karma-typescript` needs to be rebuilt and reinstalled to make sure the tests are running the latest local version of the source code. A convenient way to build, install and test the latest local code is to use the scripts in the `package.json` in the root of the `karma-typescript` project, which contains scripts for building, installing and running the test suites.

From the root of the `karma-typescript` project, run the following commands to build and install a fresh local version:
* `npm run build` - Transpile and pack the latest local `karma-typescript` Typescript source code.
* `npm run setup:kt:tests:integration-latest` - Install the latest local build to this project.

After building and installing the latest local build, run one of the following test suites:

* `npm run test` - Main test suite for testing bundling, frameworks, imports, performance etc. This is probably where new tests describing bugs or new features will be added.
* `npm run test:angular2` - A targeted test suite for testing code using the Angular2 framework. Also included in the main test suite.
* `npm run test:core` - A separate test suite for testing Node.js core features. Not included in the main test suite.
* `npm run test:emptyfile` - A separate test suite testing instrumentation of empty output, reported in issue #26. Not included in the main test suite.
* `npm run test:no-module` - A targeted test suite for testing code not using modules. Also included in the main test suite.
* `npm run test:react` - A targeted test suite for testing code using the React framework. Also included in the main test suite.

To run a test suite from the root of the `karma-typescript` project, simply add a prefix to tell `npm` to run from the root of this project, for example:

`npm run --prefix tests/integration-latest test:react `.

To make life easier when developing, these commands can be combined:

`npm run build && npm run setup:kt:tests:integration-latest && npm run --prefix tests/integration-latest test:react`

## Debugging tests

All of the tests suites can be run in debug mode, ie using a regular Chrome browser instead of the Chrome Headless browser. To run a test suite in debug mode, just add the suffix `:debug` to the script name, for example `npm run test:debug` or `npm run test:react:debug`.

Putting it all together:

`npm run build && npm run setup:kt:tests:integration-latest && npm run --prefix tests/integration-latest test:react:debug`

Happy contributing!

## Licensing

This software is licensed with the MIT license.

© 2016-2019 Erik Barke, Monounity

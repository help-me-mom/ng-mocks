# Integration tests for Typescript@latest

This project contains integration tests that uses the `karma-typescript` plugin itself to test the its functionality. The project is a 'living' project: the intention is that it should keep up with the latest version of Typescript and new tests should be added to it describing bug fixes or new features.

## Developing
After making changes to the source code, and before running any tests, `karma-typescript` needs to be rebuilt and reinstalled to make sure the tests are running the latest local version of the source code. A convenient way to build, install and test the latest local code is to use the scripts in the `package.json` in the root of the `karma-typescript` project, which contains scripts for building, installing and running the test suites.

Please note that  `karma-typescript` is maintained as a [Lerna](https://lerna.js.org/) monorepo.

From the root of the `karma-typescript` project, run the following commands to build and install a fresh local version:
* `npm run build` - Transpile the latest local `karma-typescript` Typescript source code.
* `node ci-install.js` - Install the latest local build to this project.

After building and installing the latest local build, run the test suite:

* `npm run test:integration`

To make life easier when developing, these commands can be combined:

`npm run build && node ci-install.js && npm run test:integration`

[Contributing guidelines](https://github.com/monounity/karma-typescript/wiki/Contributing)

Happy contributing!

## Licensing

This software is licensed with the MIT license.

© 2016-2021 Erik Barke, Monounity

# Integration tests

This project contains a suite of integration tests that uses the `karma-typescript` plugin itself to test the its functionality.

### Running the tests

There are a handful of npm scripts defined in the package.json file to make life easier when developing:

* `npm test`, runs all tests, including *lots* of tests used to check performance.
* `npm run test-angular2`, runs just the Angular2 tests.
* `npm run test-react`, runs just the React tests.

### Developing

If you want to add new functionality or fix a bug you need to copy the plugin code to node_modules before running the integration tests. On &ast;nix machines the following npm scripts will copy the code and then run the tests:

* `npm run dev`
* `npm run dev-angular2`
* `npm run dev-react`

# Regression testing

* Run all integrations tests using `npm test` or `npm run dev`.

* Make sure a new coverage html file has been created and that it contains all the expected tests with remapped coverage.

# Contributing

Contributions are most welcome and will be accepted if the guidelines in this document are followed, so before creating a pull request, make sure you have done everything in this list:

* Lint all files using the rules in `.eslintrc.js`, located in the root of the `karma-typescript` project.

* Create as small and descriptive functions and classes as possible.

* Comment your code where necessary, ie where it otherwise would be hard to understand *why* something is done in a certain way, not *what* is being done. Don't litter the code with comments like `// create a new array` or `// set the value`.

* If possible, add new integration tests that covers the new feature or bug fix.

* Run all the integration tests, no tests should fail.

* Run all the manual regression tests listed in this document.

# Integration tests for Typescript 1.8.10

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

For windows users there are corresponding scripts with a -win suffix:

* `npm run dev-win`
* `npm run dev-angular2-win`
* `npm run dev-react-win`

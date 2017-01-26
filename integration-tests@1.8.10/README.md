# Integration tests for Typescript 1.8.10

This project contains a suite of integration tests that uses the `karma-typescript` plugin itself to test the its functionality.

* `npm test`, runs all tests with Chrome and watches for changes

Each `dev` tests deletes the coverage folder and copies the `karma-typescript` source code to the `node_modules` folder.

* `npm run dev`, runs all tests with Chrome and watches for changes
* `npm run dev:ci`, runs all tests with PhantomJS once (continous integration)
* `npm run dev:ci:angular2`, runs the Angular2 tests with PhantomJS once (continous integration)
* `npm run dev:ci:react`, runs the React tests with PhantomJS once (continous integration)

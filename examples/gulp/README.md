# Integration tests for running gulp tasks

This project contains integration tests that uses the `karma-typescript` plugin itself to test the its functionality.
It was originally created by [kubut](https://github.com/kubut), describing issue [#29](https://github.com/monounity/karma-typescript/issues/29).

### Developing

If you want to add new functionality or fix a bug you need to copy the plugin code to node_modules before running the integration tests.
The following npm scripts will copy the code and then run the tests:

* `npm run dev:foo`
* `npm run dev:bar`
* `npm run dev:full`

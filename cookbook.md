# Cookbook

> Recipes for configuring `karma-typescript`

## Code and tests in separate directories

There are two ways to configure `karma-typescript` when you keep the application code and its unit tests in
separate directories and you don't want the tests to get included in the coverage report.

1. The setting `karmaTypescriptConfig.coverageOptions.exclude`, which is a `RegExp` object (or an array of
`RegExp` objects) for filtering which files get excluded from coverage instrumentation.

2. You can tell `karma-typescript` not to instrument all code for coverage automatically by adding `karma-coverage`
to the `preprocessors` array; if the presence of `karma-coverage` is detected no code will be instrumented for
coverage automatically by `karma-typescript`, giving you full control over which files should get instrumented:

```javascript
module.exports = function(config) {
    config.set({
        frameworks: ["jasmine", "karma-typescript"],
        files: [
            { pattern: "src/**/*.ts" },
            { pattern: "test/**/*.ts" }
        ],
        preprocessors: {
            "src/**/*.ts": ["karma-typescript", "coverage"],
            "test/**/*.ts": ["karma-typescript"]
        },
        reporters: ["progress", "karma-typescript"],
        browsers: ["Chrome"]
    });
};
```

## Importing ES2015 (aka ES6) modules

Modules written in ES6 syntax can't be run in a web browser directly (yet) and need to be compiled to
ES5 syntax first. To do this automatically on each test run, you can use the bundler plugin
[karma-typescript-es6-transform](https://github.com/monounity/karma-typescript-es6-transform):

First, install the ES6 transforms plugin as a dev dependency:

```bash
npm install --save-dev karma-typescript-es6-transform
```

And then in the Karma configuration, configure the bundler to use the plugin:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [require("karma-typescript-es6-transform")()]
    }
}
```

## Emulating Css Modules

This recipe emulates the behavior of Css Modules by replacing the contents of a `.css` file with an object literal
in the bundle. It uses the bundler transforms API and implementents an inline transforms function in the Karma config:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            function(context, callback) {
                if(context.module === "./main.css") {
                    context.source = "module.exports = { color: red };";
                    return callback(undefined, true);
                }
                return callback(undefined, false);
            }
        ]
    }
}
```

## Emulating webpack's define plugin with bundler constants:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        constants: {
            __PRODUCTION__: false
        }
    }
}
```

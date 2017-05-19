# karma-typescript-es6-transform

[![Npm version](https://img.shields.io/npm/v/karma-typescript-es6-transform.svg)](https://www.npmjs.com/package/karma-typescript-es6-transform)
[![Travis build status](https://travis-ci.org/monounity/karma-typescript-es6-transform.svg?branch=master)](https://travis-ci.org/monounity/karma-typescript-es6-transform)
[![Appveyor build status](https://ci.appveyor.com/api/projects/status/xxj96uxqhf8la0bo/branch/master?svg=true)](https://ci.appveyor.com/project/monounity/karma-typescript-es6-transform/branch/master)

> Karma-Typescript :heart: ES2015

This plugin uses the [Babel compiler](https://www.npmjs.com/package/babel-core) to transform ES2015 (aka ES6) code to ES5 syntax, making the code browser compatible when running tests with [karma-typescript](https://github.com/monounity/karma-typescript).

## Installation

```
$ npm install --save-dev karma-typescript-es6-transform
```

## Configuration

In the `karma-typescript` section of `karma.conf.js`:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            require("karma-typescript-es6-transform")()
        ]
    }
}
```

## Babel core options

By default, the options `presets: ["es2015"]` and `filename: TransformContext.filename` are passed to the [Babel compiler](https://www.npmjs.com/package/babel-core).

Custom options can be passed to the compiler in the first argument when calling the plugin:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            require("karma-typescript-es6-transform")({presets: ["es2016"]})
        ]
    }
}
```

Passing custom `presets` or `filename` options will override the default settings.

## ES2015 syntax detection

The javascript code passed to the plugin is statically analyzed by recursively traversing
the AST, looking for these ES2015 keywords: `class`, `const`, `export`, `import`, `let`.
If any keyword or a fat arrow function is found the code will be transformed to ES5 syntax.


## Licensing

This software is licensed with the MIT license.

© 2016-2017 Erik Barke, Monounity

# karma-typescript-es6-transform

<a href="https://www.npmjs.com/package/karma-typescript-es6-transform"><img alt="Npm Version" src="https://img.shields.io/npm/v/karma-typescript-es6-transform.svg"></a>
<a href="https://www.npmjs.com/package/karma-typescript-es6-transform"><img alt="Npm Total Downloads" src="https://img.shields.io/npm/dt/karma-typescript-es6-transform.svg"></a>
<a href="https://travis-ci.org/monounity/karma-typescript"><img alt="Travis Status" src="https://img.shields.io/travis/monounity/karma-typescript/master.svg?label=travis"></a>
<a href="https://ci.appveyor.com/project/monounity/karma-typescript"><img alt="Appveyor Status" src="https://img.shields.io/appveyor/ci/monounity/karma-typescript/master.svg?label=appveyor"></a>

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

By default, the options `presets: [["@babel/preset-env"]]` and `filename: TransformContext.filename` are passed to the [Babel compiler](https://www.npmjs.com/package/babel-core).

Custom options can be passed to the compiler in the first argument when calling the plugin:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            require("karma-typescript-es6-transform")({
                presets: [
                    ["@babel/preset-env", {
                        targets: {
                            chrome: "60"
                        }
                    }]
                ]
            })
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

© 2016-2021 Erik Barke, Monounity

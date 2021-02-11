# karma-typescript-cssmodules-transform

<a href="https://www.npmjs.com/package/karma-typescript-cssmodules-transform"><img alt="Npm Version" src="https://img.shields.io/npm/v/karma-typescript-cssmodules-transform.svg"></a>
<a href="https://travis-ci.org/monounity/karma-typescript"><img alt="Travis Status" src="https://img.shields.io/travis/monounity/karma-typescript/master.svg?label=travis"></a>
<a href="https://ci.appveyor.com/project/monounity/karma-typescript"><img alt="Appveyor Status" src="https://img.shields.io/appveyor/ci/monounity/karma-typescript/master.svg?label=appveyor"></a>

> Karma-Typescript :heart: CSS Modules

This plugin is a specialized [PostCSS runner](http://postcss.org/), which transforms CSS `:exports` blocks to JSON on the fly when running tests with [karma-typescript](https://github.com/monounity/karma-typescript).

The CSS Modules specification is implemented by running PostCSS with these plugins:
- [postcss-modules-local-by-default](https://github.com/css-modules/postcss-modules-local-by-default)
- [postcss-modules-extract-imports](https://github.com/css-modules/postcss-modules-extract-imports)
- [postcss-modules-scope](https://github.com/css-modules/postcss-modules-scope)
- [postcss-modules-values](https://github.com/css-modules/postcss-modules-values)

## Installation

```
$ npm install --save-dev karma-typescript-cssmodules-transform
```

## Configuration

In the `karma-typescript` section of `karma.conf.js`:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            require("karma-typescript-cssmodules-transform")()
        ]
    }
}
```

## Options

Custom options can be passed to the runner in the first argument when calling the plugin:

- [PostCSS options](https://github.com/postcss/postcss). Optional, but the properties `to`
  and `from` are _always_ set to the filename of the CSS file automatically.
- Custom options. Optional, defaults to:
```javascript
{
    generateScopedName: "[name]_[local]_[hash:base64:5]",
    mode: "local" // valid options are "local" | "global" | "pure"
}
```
- A `RegExp` object to filter which files should be processed.<br/>
  Optional, defaults to `/\.css$/`.

An example using a custom scope name generator string and a `RegExp` filter:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            require("karma-typescript-cssmodules-transform")(
                {}, { generateScopedName: "[local]___[hash:base64:5]" } /\.css$/
            )
        ]
    }
}
```

## Licensing

This software is licensed with the MIT license.

© 2016-2021 Erik Barke, Monounity

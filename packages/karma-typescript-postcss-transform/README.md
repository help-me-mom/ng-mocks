# karma-typescript-postcss-transform

[![Npm version](https://img.shields.io/npm/v/karma-typescript-postcss-transform.svg)](https://www.npmjs.com/package/karma-typescript-postcss-transform)
[![Travis build status](https://travis-ci.org/monounity/karma-typescript.svg?branch=master)](https://travis-ci.org/monounity/karma-typescript)
[![Appveyor build status](https://ci.appveyor.com/api/projects/status/00jpjueuxw4auaqb/branch/master?svg=true)](https://ci.appveyor.com/project/monounity/karma-typescript/branch/master)

> Karma-Typescript :heart: PostCSS

This plugin is a generic [PostCSS runner](http://postcss.org/), which transforms CSS with JavaScript on the fly when running tests with [karma-typescript](https://github.com/monounity/karma-typescript).

## Installation

```
$ npm install --save-dev karma-typescript-postcss-transform
```

## Configuration

In the `karma-typescript` section of `karma.conf.js`:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            require("karma-typescript-postcss-transform")([require("some-plugin")])
        ]
    }
}
```

## Options

Custom options can be passed to the runner in the first argument when calling the plugin:

- An array of PostCSS plugins
- [PostCSS options](https://github.com/postcss/postcss). Optional, but the properties `to`
  and `from` are _always_ set to the filename of the CSS file automatically.
- A `RegExp` object to filter which files should be processed.<br/>
  Optional, defaults to `/\.css$/`.

An example using the plugin `autoprefixer` with inline sourcemaps and a `RegExp` filter:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            require("karma-typescript-postcss-transform")(
                [require("autoprefixer")], { map: { inline: true } }, /\.css$/
            )
        ]
    }
}
```

## Licensing

This software is licensed with the MIT license.

© 2016-2017 Erik Barke, Monounity

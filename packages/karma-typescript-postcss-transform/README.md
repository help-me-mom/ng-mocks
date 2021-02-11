# karma-typescript-postcss-transform

<a href="https://www.npmjs.com/package/karma-typescript-postcss-transform"><img alt="Npm Version" src="https://img.shields.io/npm/v/karma-typescript-postcss-transform.svg"></a>
<a href="https://travis-ci.org/monounity/karma-typescript"><img alt="Travis Status" src="https://img.shields.io/travis/monounity/karma-typescript/master.svg?label=travis"></a>
<a href="https://ci.appveyor.com/project/monounity/karma-typescript"><img alt="Appveyor Status" src="https://img.shields.io/appveyor/ci/monounity/karma-typescript/master.svg?label=appveyor"></a>

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

© 2016-2021 Erik Barke, Monounity

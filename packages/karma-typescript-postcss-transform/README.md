# karma-typescript-postcss-transform

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
            require("karma-typescript-postcss-transform")([plugin1, plugin2])
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
  Optional, defaults to `/.css$/`.

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            require("karma-typescript-postcss-transform")(
                [plugin1, plugin2], { opt1: ..., opt2: ... }, /pattern/
            )
        ]
    }
}
```

The PostCSS options `to` and `from` are automatically set to the filename of CSS file.

## Licensing

This software is licensed with the MIT license.

© 2016-2017 Erik Barke, Monounity

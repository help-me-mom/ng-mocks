# karma-typescript
Run unit tests in-memory for a [Typescript](https://www.typescriptlang.org/) project, optionally including sourcemaps and chaining Istanbul with remap for test coverage.

Changes are detected on the fly, no need for additional build steps or manually building the project when running the tests.

### Examples

* [Runnable example with AMD/RequireJS format, sourcemaps and remapped Istanbul coverage](https://github.com/monounity/karma-typescript/tree/master/example-project-amd-coverage)

* [Runnable example with CommonJS format, sourcemaps and remapped Istanbul coverage](https://github.com/monounity/karma-typescript/tree/master/example-project-commonjs-coverage)

### Installation
`npm install karma-typescript --save-dev`

### Configuration

The `karmaTypescript` configuration section is optional, if left out the files will be transpiled using the compiler default options.

There are runnable examples included

```javascript
preprocessors: {
    '**/*.ts': ['karma-typescript']
},

karmaTypescript: {

    /*
    Relative path to a tsconfig.json file, the
    preprocessor will look for the file starting
    from the directory where Karma was started.
    This property is optional.
    */
    tsconfigPath: 'tsconfig.json',

    /*
    A function for custom file path transformation.
    This property is optional.
    */
    transformPath: function(filepath) {
        return filepath.replace(/\.ts$/, '.js')
    },

    /*
    These are options for the Typescript compiler.
    They will override the options in the tsconfig.json
    file specified in tsconfigPath above.
    This property is optional.
    */
    options: {
        sourceMap: true,
        target: 'es5',
        module: 'commonjs'
        // ... More options are available at:
        // https://www.typescriptlang.org/docs/handbook/compiler-options.html
    }
}
```

### Additional examples

* [Runnable example with AMD format + sourcemaps for debugging in a browser](https://github.com/monounity/karma-typescript/tree/master/example-project-amd)

* [Runnable example with CommonJS formatsourcemaps for debugging in a browser](https://github.com/monounity/karma-typescript/tree/master/example-project-commonjs)

### Licensing

This software is licensed with the MIT license.

© 2016 Monounity

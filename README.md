# karma-typescript

[![Npm version](https://img.shields.io/npm/v/karma-typescript.svg)](https://www.npmjs.com/package/karma-typescript)
[![Npmjs downloads](https://img.shields.io/npm/dt/karma-typescript.svg)](https://www.npmjs.com/package/karma-typescript)
[![Travis build status](https://travis-ci.org/monounity/karma-typescript.svg?branch=2.1.8)](https://travis-ci.org/monounity/karma-typescript)
[![Appveyor build status](https://ci.appveyor.com/api/projects/status/00jpjueuxw4auaqb?svg=true)](https://ci.appveyor.com/project/monounity/karma-typescript)

> Karma :heart: Typescript

* Run unit tests written in Typescript with full type checking, seamlessly without extra build steps or scripts.
* Get remapped test coverage with [karma-coverage](https://github.com/karma-runner/karma-coverage) and [Istanbul](https://github.com/gotwarlost/istanbul).
* Use plain Typescript or a framework: Angular2, AngularJS, React, Sinon, any framework of choice.

## Installation

The easiest way is to keep `karma-typescript` as a devDependency in `package.json`:

```json
{
  "devDependencies": {
    "karma": "^1.3.0",
    "karma-typescript": "2.1.7"
  }
}
```

Do this by installing the plugin via npm:

```
npm install --save-dev karma-typescript
```

## Configuration

Bare minimum configuration can be achieved with the following `karma.conf.js` file:

```javascript
module.exports = function(config) {
    config.set({
        frameworks: ["jasmine", "karma-typescript"],
        files: [
            { pattern: "src/**/*.ts" }, // *.tsx for React Jsx
        ],
        preprocessors: {
            "**/*.ts": ["karma-typescript"], // *.tsx for React Jsx
        },
        reporters: ["progress", "karma-typescript"],
        browsers: ["Chrome"]
    });
};
```

The above eaxample will compile all Typescript files and run the unit tests, producing remapped coverage in `./coverage`.

## Examples

### Frameworks and Integrations

- [Angular2](https://github.com/monounity/karma-typescript/tree/master/examples/angular2)
- [AngularJS](https://github.com/monounity/karma-typescript/tree/master/examples/angularjs)
- [Docker](https://github.com/monounity/karma-typescript/tree/master/examples/docker)
- [Gulp](https://github.com/monounity/karma-typescript/tree/master/examples/gulp)
- [Mocha](https://github.com/monounity/karma-typescript/tree/master/examples/mocha)

### Other examples

- Typescript [1.8.10 to 2.0.0^](https://github.com/monounity/karma-typescript/tree/master/examples/typescript-latest)
- Typescript [1.6.2 to 1.7.5](https://github.com/monounity/karma-typescript/tree/master/examples/typescript-1.6.2)
- Typescript [1.8.10](https://github.com/monounity/karma-typescript/tree/master/tests/integration-1.8.10/src)
- Typescript [@latest](https://github.com/monounity/karma-typescript/tree/master/tests/integration-latest/src)

### Example output

<img src="http://i.imgur.com/sc4Mswh.png" width="580" height="280" />

- [Angular2 screenshot](https://github.com/monounity/karma-typescript/blob/master/assets/angular2.png)
- [React screenshot](https://github.com/monounity/karma-typescript/blob/master/assets/react.png)

## Advanced configuration

The plugin has default settings for the compiler, instrumenting files and creating reports etc, which should suit most needs.

These are the default compiler settings:

```javascript
compilerOptions: {
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    jsx: "react",
    module: "commonjs",
    sourceMap: true,
    target: "ES5"
},
exclude: ["node_modules"]
```

The default `karma-coverage` instrumentation settings:

```javascript
coverageReporter: {
    instrumenterOptions: {
        istanbul: { noCompact: true }
    }
}
```

If the defaults aren't enough, the settings can be configured from `karma.conf.js`:

* **karmaTypescriptConfig.bundlerOptions.addNodeGlobals** - Boolean indicating whether the global variables
  `process` and `Buffer` should be added to the bundle.<br/>
  Defaults to `true`.

* **karmaTypescriptConfig.bundlerOptions.entrypoints** - A regex filtering which files loaded by Karma should be executed in
   a test run, for example only filenames ending with ".spec.ts": `/\.spec\.ts$/`.<br/>
   This setting can be used to make sure the specs have finished setting up the test environment before other code starts
   requiring modules, which otherwise could lead to subtle bugs caused by race conditions.<br/>
   Defaults to all files, `/.*/`.

* **karmaTypescriptConfig.bundlerOptions.exclude** - An array of npm module names that will be excluded from the bundle.

* **karmaTypescriptConfig.bundlerOptions.ignore** - An array of npm module names that will be bundled as stubs, ie `module.exports = {};`.

* ~~**karmaTypescriptConfig.bundlerOptions.ignoredModuleNames** - An array of npm module names to be excluded from the bundle.~~<br/>
  **Deprecated**, will be removed in future versions. Please use `karmaTypescriptConfig.bundlerOptions.exclude` instead.

* **karmaTypescriptConfig.bundlerOptions.noParse** - An array of module names that will be bundled without being parsed for dependencies.

* **karmaTypescriptConfig.bundlerOptions.resolve.alias** - An object literal where the key is a module name
  and the value is a path that will be used when resolving the module.<br/>
  The key is a regular expression.

* **karmaTypescriptConfig.bundlerOptions.resolve.extensions** - An array of file extensions to use, in order, when resolving modules.<br/>
  Defaults to `[".js", ".json", ".ts", ".tsx"]`.

* **karmaTypescriptConfig.bundlerOptions.resolve.directories** - An array of directories where modules will be recursively looked up.<br/>
  Defaults to `["node_modules"]`.

* **karmaTypescriptConfig.bundlerOptions.validateSyntax** - A boolean indicating whether the syntax ofthe bundled code should be validated.
  Setting this to `false` may speed up bundling for large projects with lots of imports from `node_modules`.<br/>
  Defaults to `true`.

* **karmaTypescriptConfig.compilerOptions** - This setting will override or add to existing compiler options.<br/>
  Valid options are the same as for the `compilerOptions` section in `tsconfig.json`, with the
  exception of `outDir`and `outFile` which are ignored since the code is compiled in-memory.

* **karmaTypescriptConfig.coverageOptions.instrumentation** - A boolean indicating whether the code should be instrumented,
  set to `false` to see the original Typescript code when debugging.<br/>
  Defaults to true.

* **karmaTypescriptConfig.coverageOptions.exclude** - A `RegExp` object or an array of `RegExp` objects for filtering which files should be excluded from coverage instrumentation.<br/>
  Defaults to `/\.(d|spec|test)\.ts$/i` which excludes &ast;.d.ts, &ast;.spec.ts and &ast;.test.ts (case insensitive).

* **karmaTypescriptConfig.coverageOptions.threshold** - An object with minimum coverage thresholds. The threshold values can be set on
  a global level and on a per-file level, with options to exclude files and directories, and override settings on a per-file basis using globbing patterns.
    * A positive value will be used as a minimum percentage, for example `statements: 50` means that at least 50% of the statements should be covered by a test.
    * A negative value will be used as a maximum number of uncovered items, for example `lines: 10` means that no more than 10 uncovered lines are allowed.
    * Full threshold configuration:
    ```javascript
    threshhold: {
        global: {
            statements: 100,
            branches: 100,
            functions: -10,
            lines: 100,
            excludes: [
                "src/foo/**/*.js"
            ]
        },
        file: {
            statements: -10,
            branches: 100,
            functions: 100,
            lines: 100,
            excludes: [
                "src/bar/**/*.js"
            ],
            overrides: {
                "src/file.js": {
                    statements: 90
                }
            }
        }
    }
    ```

* **karmaTypescriptConfig.exclude** - An array of file patterns to be excluded by the compiler.
  The values will be merged with existing options.<br/>
  Defaults to `["node_modules"]`.

* ~~**karmaTypescriptConfig.excludeFromCoverage** - A regex for filtering which files should be excluded from coverage instrumentation.<br/>
  Defaults to `/\.(d|spec|test)\.ts/` which excludes &ast;.d.ts, &ast;.spec.ts and &ast;.test.ts.~~<br/>
  **Deprecated**, will be removed in future versions. Please use `karmaTypescriptConfig.coverageOptions.exclude` instead.

* ~~**karmaTypescriptConfig.disableCodeCoverageInstrumentation** - If set to true, code coverage instrumentation will be
  disabledand the original TypeScript code will be shown when debugging.~~<br/>
  **Deprecated**, will be removed in future versions. Please use `karmaTypescriptConfig.coverageOptions.instrumentation` instead.

* **karmaTypescriptConfig.include** - An array of file patterns to be included by the compiler. The values will be merged with existing options.<br/>
  This option is available in Typescript 2.0.0^.

* **karmaTypescriptConfig.remapOptions** - Pass options to `remap-istanbul`.

    * Available options:

        * `exclude`, a regex for excluding files from remapping
        * `warn`, a function for handling error messages

* **karmaTypescriptConfig.reports** - The types of coverage reports that should be created when running the tests,
  defaults to an html report in the directory `./coverage`.
  Reporters are configured as `"reporttype": destination` where the destination can be specified in three ways:
    
    * A `string` with a directory path, for example `"html": "coverage"`.
    * An empty string or `null`. Writes the output to the console, for example `"text-summary": ""`. This is only possible for a subset of the reports available.
    * An `object` with more fine-grained control over path and filename:
    ```javascript
    "cobertura": {
        "directory": "coverage",    // optional, defaults to 'coverage'
        "subdirectory": "cobertura" // optional, defaults to the name of the browser running the tests
        "filename": "coverage.xml", // optional, defaults to the report name
    }
    ```

    * Available report types:
        * `"clover": destination`
        * `"cobertura": destination`
        * `"html": destination`
        * `"json-summary": destination`
        * `"json": destination`
        * `"lcovonly": destination`
        * `"teamcity": destination` (redirects to the console with destination "" or `null`)
        * `"text-lcov": destination` (redirects to the console with destination "" or `null`)
        * `"text-summary": destination` (redirects to the console with destination "" or `null`)
        * `"text": destination` (redirects to the console with destination "" or `null`)

    * Example of the three destination types:
    ```javascript
    karmaTypescriptConfig: {
        reports:
        {
            "cobertura": {
                "directory": "coverage",
                "filename": "coverage.xml",
                "subdirectory": "cobertura"
            },
            "html": "coverage",
            "text-summary": ""
        }
    }
    ```

* **karmaTypescriptConfig.transformPath** - A function for renaming compiled file extensions to `.js`.<br/>
  Defaults to renaming `.ts` and `.tsx` to `.js`.

* **karmaTypescriptConfig.tsconfig** - A path to a `tsconfig.json` file.<br/>
  The default compiler options will be replaced by the options in this file.

Example of a full `karmaTypescriptConfig` configuration:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        addNodeGlobals: true,
        entrypoints: /\.spec\.(ts|tsx)$/,
        exclude: ["react/addons"],
        ignore: ["ws"],
        noParse: "jquery",
        resolve: {
            alias: {
                "@angular/upgrade/static$": "../bundles/upgrade-static.umd.js"
            },
            extensions: [".js", ".json"],
            directories: ["node_modules"]
        },
        validateSyntax: true
    },
    compilerOptions: {
        noImplicitAny: true,
    },
    coverageOptions: {
        instrumentation: true,
        exclude: /\.(d|spec|test)\.ts/i,
        threshhold: {
            global: {
                statements: 100,
                branches: 100,
                functions: -10,
                lines: 100,
                excludes: [
                    "src/foo/**/*.js"
                ]
            },
            file: {
                statements: -10,
                branches: 100,
                functions: 100,
                lines: 100,
                excludes: [
                    "src/bar/**/*.js"
                ],
                overrides: {
                    "src/file.js": {
                        statements: 90
                    }
                }
            }
        },
    },
    exclude: ["broken"],
    include: ["**/*.ts"],
    remapOptions: {
        warn: function(message){
            console.log(message);
        }
    },
    reports: {
        "cobertura": {
            "directory": "coverage",
            "filename": "cobertura/coverage.xml"
        },
        "html": "coverage",
        "text-summary": ""
    },
    transformPath: function(filepath) {
        return filepath.replace(/\.(ts|tsx)$/, ".js");
    },
    tsconfig: "./tsconfig.json"
}
```

## Stop on compilation error

If `noEmitOnError` is set to a truthy value, in either `tsconfig.json` or in the compiler options in `karmaTypescriptConfig`,
the karma process will exit with `ts.ExitStatus.DiagnosticsPresent_OutputsSkipped` if any compilation errors occur.

## Module loading and bundling for unit testing

Modules imported in Typescript code, for example `import { Component } from "@angular/core";`, will be automatically
loaded and bundled along with their dependencies.

Also, a full Node.js environment will be provided with global variables and browser shims for builtin core modules:

### Module

A module object will be injected by the bundler:

```javascript
module: {
    exports: {},
    id: "foo/bar.ts",
    uri: "/users/home/dev/src/foo/bar.ts"
}
```

The `module.id` will be calculated from the value of `module.uri`, relative to the Karma config `basePath` value.

Modules exporting an extensible object such as a *function* or an *object literal* will also be decorated with
a non-enumerable `default` property if `module.exports.default` is undefined.

### Globals

* &#95;&#95;dirname
* &#95;&#95;filename
* Buffer
* global
* process

### Browser shims
* [assert](https://www.npmjs.com/package/assert)
* [buffer](https://www.npmjs.com/package/buffer)
* [console](https://www.npmjs.com/package/console-browserify)
* [constants](https://www.npmjs.com/package/constants-browserify)
* [crypto](https://www.npmjs.com/package/crypto-browserify)
* [domain](https://www.npmjs.com/package/domain-browser)
* [events](https://www.npmjs.com/package/events)
* [http](https://www.npmjs.com/package/stream-http)
* [https](https://www.npmjs.com/package/https-browserify)
* [os](https://www.npmjs.com/package/os-browserify)
* [path](https://www.npmjs.com/package/path-browserify)
* [punycode](https://www.npmjs.com/package/punycode)
* [querystring](https://www.npmjs.com/package/querystring-es3)
* [stream](https://www.npmjs.com/package/stream-browserify)
* [string_decoder](https://www.npmjs.com/package/string_decoder)
* [timers](https://www.npmjs.com/package/timers-browserify)
* [tty](https://www.npmjs.com/package/tty-browserify)
* [url](https://www.npmjs.com/package/url)
* [util](https://www.npmjs.com/package/util)
* [vm](https://www.npmjs.com/package/vm-browserify)
* [zlib](https://www.npmjs.com/package/browserify-zlib)

The plugin uses [browser-resolve](https://github.com/defunctzombie/node-browser-resolve) from the [browserify](https://github.com/substack/node-browserify) tool chain to load the source code from node_modules.

Note: automatic bundling will only be performed if `compilerOptions.module` is set to `"commonjs"`,
and there are import statements in the Typescript source code.

## Importing stylesheets and bundling for production

Style files (.css|.less|.sass|.scss) are served as JSON strings to the browser running the tests,
allowing styles to be loaded using the Typescript import statement, ie `import "./style/app.scss";`.

This means styles can be imported in order to let, for instance, webpack load the styles with
less-loader or scss-loader etc for bundling later on, without breaking the unit test runner.

Note: JSON required by modules in `node_modules` will be loaded automatically by the bundler.

## Under the hood

Under the hood, `karma-typescript` chains several other npm modules in the following order:

|Module|Step|Note|
|---|---|---|
|`typescript`|Compile incrementally, in-memory with inline sourcemaps|Plain Typescript, Angular2 and Reactare included in the default compiler settings|
|`browserify`|Add module loading for browsers|Uses parts of the browserify tool chain|
|`karma-coverage`|Instrument the code with Istanbul|Instrumented code will not be compacted and &ast;.spec.ts and &ast;.test.ts are excluded|
|`remap-istanbul`|Create remapped coverage|An html report will be created in the folder ./coverage|

## Requirements

Typescript 1.6.2^ is required.

Versions 1.6.2 - 1.7.5 work but aren't as heavily tested as versions 1.8.10 and up.

## Troubleshooting

### Error: Cannot find module 'buffer/' from '.'

This error seems to hit mostly users with older versions of `npm`, where all dependencies don't get pulled in automatically by `npm`.

There's a workaround reported by users, which is simply adding the missing dependencies explicitly to `package.json`:

 * `npm install --save-dev browser-resolve`
 * `npm install --save-dev buffer`
 * `npm install --save-dev process`

Other workarounds are running `npm install` twice or, if possible, upgrading to a newer version of `npm`.

These are the environments reported failing/working:

|Npm|Node.js|OS|Works|
|---|---|---|---|
|2.5.18|4.4.7|Unknown|No|
|2.14.12|4.2.6|OSX 10.11.3|No|
|2.15.9|.5.0|OSX 10.11.6|No|
|2.15.11|4.6.2|Ubuntu 14.04|No|
|2.15.11|4.7.0|Ubuntu 14.04|Yes|
|3.5.3|4.2.1|Windows 10|Yes|
|3.10.3|6.4.0|OSX 10.11.6|Yes|
|3.10.9|6.9.2|Ubuntu 14.04|Yes|

## Licensing

This software is licensed with the MIT license.

© 2016-2017 Erik Barke, Monounity

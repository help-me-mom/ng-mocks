# karma-typescript

## What the plugin does

The plugin seamlessly runs your unit tests written in Typescript and creates coverage reports, eliminating the need for additional build steps or scripts.

It compiles your Typescript code incrementally on the fly, with full type checking, and imported modules will be automatically loaded from node_modules and bundled along with nodejs globals and builtin core modules.

Frameworks such as AngularJS, Angular2, React and Sinon (among others) are supported out of the box.

**Example screenshot**

<img src="http://i.imgur.com/sc4Mswh.png" width="580" height="280" />

## Installation and configuration

First, install the plugin:

`npm install karma-typescript --save-dev`

Then put this in your Karma config:

```javascript
frameworks: ["jasmine", "karma-typescript"],

files: [
    { pattern: "src/**/*.ts" }
],

preprocessors: {
    "**/*.ts": ["karma-typescript"]
},

reporters: ["progress", "karma-typescript"],

browsers: ["Chrome"]
```

Now run Karma and two things will happen:

* Your tests written in Typescript will be compiled and executed on the fly.
* You'll have html test coverage, remapped with `remap-istanbul` in the folder `./coverage` in the root of your project.

[Runnable example for Typescript 1.8.10 - 2.0.0^](https://github.com/monounity/karma-typescript/tree/master/example-project)<br/>
[Runnable example for Typescript 1.6.2 - 1.7.5](https://github.com/monounity/karma-typescript/tree/master/example-project@1.6.2)<br/>
[Runnable example for Angular2](https://github.com/monounity/karma-typescript/tree/master/example-project@angular2)<br/>
[Runnable example for AngularJS](https://github.com/monounity/karma-typescript/tree/master/example-project@angularjs)<br/>
[Runnable example using Mocha](https://github.com/monounity/karma-typescript/tree/master/example-project@mocha)

#### Configuration example for Angular2

karma.conf.js:
```javascript
frameworks: ["jasmine", "karma-typescript"],

files: [
    { pattern: "base.spec.ts" },
    { pattern: "src/app/**/*.+(ts|html)" }
],

proxies: {
    "/app/": "/base/src/app/"
},

preprocessors: {
    "**/*.ts": ["karma-typescript"]
},

reporters: ["progress", "karma-typescript"],

browsers: ["Chrome"]
```

base.spec.ts:
```javascript
import "reflect-metadata";
import "zone.js/dist/zone";
import "zone.js/dist/long-stack-trace-zone";
import "zone.js/dist/proxy";
import "zone.js/dist/sync-test";
import "zone.js/dist/jasmine-patch";
import "zone.js/dist/async-test";
import "zone.js/dist/fake-async-test";

import { TestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
```

Example of the resulting coverage:

<img src="http://i.imgur.com/KVGVyxr.png" width="579" height="280" />

#### Configuration example for React

```javascript
frameworks: ["jasmine", "karma-typescript"],

files: [
    { pattern: "src/**/*.tsx" }
],

preprocessors: {
    "src/**/*.tsx": ["karma-typescript"]
},

reporters: ["progress", "karma-typescript"],

browsers: ["Chrome"]
```

Example of the resulting coverage:

<img src="http://i.imgur.com/9khrBxw.png" width="685" height="312" />

[All runnable examples and integration tests for Typescript 1.8.10](https://github.com/monounity/karma-typescript/tree/master/integration-tests@1.8.10/src)<br/>
[All runnable examples and integration tests for Typescript 2.0.0^](https://github.com/monounity/karma-typescript/tree/master/integration-tests@latest/src)

## Under the hood

Under the hood, `karma-typescript` chains several other npm modules in the following order:

|Module|Step|Note|
|---|---|---|
|`typescript`|Compile incrementally, in-memory with inline sourcemaps|Plain Typescript, Angular2 and React are included in the default compiler settings|
|`browserify`|Add module loading for browsers|Uses parts of the browserify tool chain|
|`karma-coverage`|Instrument the code with Istanbul|Instrumented code will not be compacted and &ast;.spec.ts and &ast;.test.ts are excluded|
|`remap-istanbul`|Create remapped coverage|An html report will be created in the folder ./coverage|

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

* `karmaTypescriptConfig.tsconfig` - A path to a `tsconfig.json` file. The default compiler options will be replaced by the options in this file.

* `karmaTypescriptConfig.compilerOptions` - This setting will override or add to existing compiler options.<br/>
Valid options are the same as for the `compilerOptions` section in `tsconfig.json`, with the exception of `outDir` and `outFile` which are ignored since the code is compiled in-memory.

* `karmaTypescriptConfig.exclude` - An array of file patterns to be excluded by the compiler. The values will be merged with existing options. The folder `node_modules` is excluded by default.

* `karmaTypescriptConfig.include` - An array of file patterns to be included by the compiler. The values will be merged with existing options. This option is available in Typescript 2.0.0^.

* `karmaTypescriptConfig.disableCodeCoverageInstrumentation` - If set to true, code coverage instrumentation will be disabled and you will see the original TypeScript code when debugging.

* `karmaTypescriptConfig.excludeFromCoverage` - A regex for filtering which files should be excluded from coverage instrumentation. Defaults to `/\.(d|spec|test)\.ts/` which excludes &ast;.d.ts, &ast;.spec.ts and &ast;.test.ts.

* `karmaTypescriptConfig.bundlerOptions.ignoredModuleNames` - An array of npm modules to be ignored by the bundler. Useful if a module in node_modules conditionally requires deprecated modules.

* `karmaTypescriptConfig.reports` - The types of coverage reports that should be created when running the tests. Defaults to an html report in the directory `./coverage`.

    * Available report types:

        * `"clover": "coverage"`
        * `"cobertura": "coverage"`
        * `"html": "coverage"`
        * `"json-summary": "coverage"`
        * `"json": "coverage"`
        * `"lcovonly": "coverage"`

    * The following reporters can have their output written directly to the
    console by setting the destination to "" or null, ie "text-summary": "":

        * `"teamcity": "coverage", // "destination/path" or null or ""`
        * `"text-lcov": "coverage", // ...`
        * `"text-summary": "coverage",`
        * `"text": "coverage"`

* `karmaTypescriptConfig.transformPath` - A function for renaming compiled file extensions to `.js`. Defaults to renaming `.ts` and `.tsx` to `.js`.

* `karmaTypescriptConfig.transformPath` - A function for renaming compiled file extensions to `.js`. Defaults to renaming `.ts` and `.tsx` to `.js`.

* `karmaTypescriptConfig.remapOptions` - Pass options to `remap-istanbul`.

    * Available options:

        * `exclude`, a regex for excluding files from remapping
        * `warn`, a function for handling error messages

Example of a full `karmaTypescriptConfig` configuration:

```javascript
karmaTypescriptConfig: {
    tsconfig: "./tsconfig.json",
    compilerOptions: {
        noImplicitAny: true,
    },
    include: ["**/*.ts"],
    exclude: ["broken"],
    bundlerOptions: {
        ignoredModuleNames: ["react/addons"],
    },
    disableCodeCoverageInstrumentation: false,
    excludeFromCoverage: /\.(d|spec|test)\.ts/,
    remapOptions: {
        warn: function(message){
            console.log(message);
        }
    },
    reports:
    {
        "html": "coverage",
        "text-summary": ""
    },
    transformPath: function(filepath) {
        return filepath.replace(/\.(ts|tsx)$/, ".js");
    }
},
```

## Stop on compilation error

If `noEmitOnError` is set to a truthy value, in either `tsconfig.json` or in the compiler options in `karmaTypescriptConfig`, the karma process will exit with `ts.ExitStatus.DiagnosticsPresent_OutputsSkipped` if any compilation errors occur.

## Module loading and bundling for unit testing

Modules imported in Typescript code, for example `import { Component } from "@angular/core";`, will be automatically loaded and bundled along with their dependencies.

Also, a full Node.js environment will be provided with global variables and browser shims for builtin core modules:

#### Globals

* &#95;&#95;dirname
* &#95;&#95;filename
* Buffer
* global
* process

#### Browser shims
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

The plugin uses [detective](https://github.com/substack/node-detective) and [browser-resolve](https://github.com/defunctzombie/node-browser-resolve) from the [browserify](https://github.com/substack/node-browserify) tool chain to traverse the dependency tree and load the source code from node_modules.

Note: automatic bundling will only be performed if `compilerOptions.module` is set to `"commonjs"`, and there are import statements in the Typescript source code.

## Importing stylesheets and bundling for production

Style files (.css|.less|.sass|.scss) are served as dummy modules to the browser running the tests, allowing you to load styles using the Typescript import statement, ie `import "./style/app.scss";`.

This means you can import styles in order to let, for instance, webpack load the styles with less-loader or scss-loader etc for bundling later on, without breaking the unit test runner.

Note: JSON required by modules in `node_modules` will be loaded automatically by the bundler.

## Requirements

Typescript 1.6.2^ is required.

Versions 1.6.2 - 1.7.5 work but aren't as heavily tested as versions 1.8.10 and up.

## Licensing

This software is licensed with the MIT license.

© 2016 Erik Barke, Monounity

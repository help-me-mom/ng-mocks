# karma-typescript

## What the plugin does

The plugin seamlessly runs your unit tests written in Typescript and creates coverage reports, eliminating the need for additional build steps or scripts.

It compiles your Typescript code incrementally on the fly, with full type checking, and imported modules will be automatically loaded from node_modules and bundled along with nodejs globals and builtin core modules.

Frameworks such as AngularJS, Angular2, React and Sinon (among others) are supported out of the box.

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

* Your tests written in Typescript will be executed on-the-fly.
* You'll have html test coverage, remapped with `remap-istanbul` in the folder `./coverage` in the root of your project.


[Runnable example for Typescript 1.8.10 - 2.0.0^](https://github.com/monounity/karma-typescript/tree/master/example-project)<br>
[Runnable example for Typescript 1.6.2 - 1.7.5](https://github.com/monounity/karma-typescript/tree/master/example-project@1.6.2)

#### Configuration example for Angular2

```javascript
frameworks: ["jasmine", "karma-typescript"],

files: [
    { pattern: "node_modules/reflect-metadata/Reflect.js" },
    { pattern: "node_modules/zone.js/dist/zone.js" },
    { pattern: "node_modules/zone.js/dist/long-stack-trace-zone.js" },
    { pattern: "node_modules/zone.js/dist/proxy.js" },
    { pattern: "node_modules/zone.js/dist/sync-test.js" },
    { pattern: "node_modules/zone.js/dist/jasmine-patch.js" },
    { pattern: "node_modules/zone.js/dist/async-test.js" },
    { pattern: "node_modules/zone.js/dist/fake-async-test.js" },

    { pattern: "src/**/*.ts" }
],

preprocessors: {
    "src/**/*.ts": ["karma-typescript"]
},

reporters: ["progress", "karma-typescript"],

browsers: ["Chrome"]
```

Example of the resulting coverage:

<img src="http://i.imgur.com/jzxHaiW.png" width="579" height="264" />

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

[All runnable examples and integration tests for Typescript 1.8.10](https://github.com/monounity/karma-typescript/tree/master/integration-tests@1.8.10/src)<br>
[All runnable examples and integration tests for Typescript 2.0.0^](https://github.com/monounity/karma-typescript/tree/master/integration-tests@latest/src)

## Under the hood

Under the hood, `karma-typescript` chains several other useful plugins and configures them with sensible defaults, in the following order:

|Module|Step|Note|
|---|---|---|
|`typescript`|Compile incrementally to in-memory with inline sourcemaps|Plain Typescript, Angular2 and React are included in the default compiler settings|
|`browserify`|Add module loading for browsers|Uses parts of the browserify tool chain|
|`karma-coverage`|Instrument the code with Istanbul|Instrumented code will not be compacted and &ast;.spec.ts and &ast;.test.ts are excluded|
|`remap-istanbul`|Create remapped coverage|An html report will be created in the folder ./coverage|

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

The plugin uses [detective](https://github.com/substack/node-detective) and [browser-resolve](https://github.com/defunctzombie/node-browser-resolve) from the `browserify` tool chain to traverse the dependency tree and load the source code from `node_modules`.

## Importing stylesheets and bundling for production

Style files (.css|.less|.sass|.scss) are served as dummy modules to the browser running the tests, allowing you to load styles using the Typescript `import` statement, ie `import "./style/app.scss";`.

This means you can import styles in order to let, for instance, `webpack` load the styles with  `sass-loader` or `less-loader` etc for bundling later on, without breaking the unit test runner.

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

* `karmaTypescriptConfig.tsconfig` - A path to a `tsconfig.json` file. If specified, it will override the default compiler settings.

* `karmaTypescriptConfig.compilerOptions` - If specified, this setting will override/add to the default compiler options or the compiler options found in `karmaTypescriptConfig.tsconfig`.<br>
Valid options are the same as for the `compilerOptions` section in a `tsconfig.json`file, with the exception of `outDir` and `outFile` which are ignored since the code is compiled in-memory.

* `karmaTypescriptConfig.exclude` - An array of file patterns to exclude in the compilation. The values will be merged with the default options or the options found in `karmaTypescriptConfig.tsconfig`. The folder `node_modules` is excluded by default.

* `karmaTypescriptConfig.include` - An array of file patterns to include in the compilation. The values will be merged with the default options or the options found in `karmaTypescriptConfig.tsconfig`.

* `karmaTypescriptConfig.disableCodeCoverageInstrumentation` - If set to true, code coverage instrumentation will be disabled and you will see the original TypeScript code when debugging.

* `karmaTypescriptConfig.excludeFromCoverage` - A regex to filter which files should be excluded from coverage instrumentation. Defaults to `/\.(d|spec|test)\.ts/` which excludes &ast;.d.ts, &ast;.spec.ts and &ast;.test.ts.

* `karmaTypescriptConfig.reports` - The types of coverage reports that should be created when running the tests. Defaults to an html report in the directory `./coverage`.

    * These are the available report types:
```javascript
reports: {
        "clover": "coverage",
        "cobertura": "coverage",
        "html": "coverage",
        "json-summary": "coverage",
        "json": "coverage",
        "lcovonly": "coverage",

        /*
            The following reporters can have the output written directly to the
            console by setting the destination to "" or null, ie "text-summary": "".
        */
        "teamcity": "coverage", // "destination/path" or null or ""
        "text-lcov": "coverage", // ...
        "text-summary": "coverage",
        "text": "coverage"
    }
```

* `karmaTypescriptConfig.transformPath` - A function for renaming compiled file extensions to `.js`. Defaults to renaming `.ts` and `.tsx` to `.js`.

* `karmaTypescriptConfig.transformPath` - A function for renaming compiled file extensions to `.js`. Defaults to renaming `.ts` and `.tsx` to `.js`.

* `karmaTypescriptConfig.remapOptions` - Pass options to `remap-istanbul`.

    * Available options:
```javascript
remapOptions: {
        // Regex or string for excluding files
        exclude: /\.(spec|test)\.ts/,
        // Function for handling warning messages
        warn: function(message){}
}
```

Example of a full `karmaTypescriptConfig` configuration:

```javascript
karmaTypescriptConfig: {
    tsconfig: "./tsconfig.json",
    compilerOptions: {
        noImplicitAny: true,
    },
    include: ["**/*.ts"],
    exclude: ["broken"],
    disableCodeCoverageInstrumentation: false,
    excludeFromCoverage: /\.(d|spec|test)\.ts/,
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

## Requirements

Typescript 1.6.2^ is required.

Versions 1.6.2 - 1.7.5 work but aren't as heavily tested as versions 1.8.10 and up.

Please also note that more accurate test coverage remapping is produced for Typescript 1.8.10^.

## Licensing

This software is licensed with the MIT license.

© 2016 Erik Barke, Monounity

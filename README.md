# karma-typescript
> Run unit tests written in Typescript; Coverage with [karma-coverage](https://github.com/karma-runner/karma-coverage) and [istanbul](https://github.com/gotwarlost/istanbul)

### Installation
The easiest way is to keep `karma-typescript` as a devDependency in your package.json.
```json
{
  "devDependencies": {
    "karma-typescript": "2.1.4"
  }
}
```
do this by issuing `npm install --save-dev karma-typescript`

### Configuration
bare minimum configuration can be achieved with the following `karma.conf.j´s` file:

```js
module.exports = function(config) {
  config.set({
    frameworks: ["jasmine", "karma-typescript"],
        files: [
            { pattern: "src/**/*.ts" },
            // { pattern: "src/**/*.tsx" }, /** glob for React Jsx */
        ],
        preprocessors: {
            "**/*.ts": ["karma-typescript"],
            // "**/*.tsx": ["karma-typescript"] /** glob for React Jsx */
        },
        reporters: ["progress", "karma-typescript"],
  });
};
```

### Usage
the easiest way is, again, the package.json. Add a new "script" prop
```json
{
    "scripts": {
        "test": "karma start karma.conf.js",
    }
}
```
From a terminal, issue `npm run test`.
If you installed Karma globally, you can issue `karma start karma.conf.js` directly instead.

### Examples

##### Frameworks and Integrations

- [Angular2](https://github.com/monounity/karma-typescript/tree/master/example-project%40angular2)
- [AngularJS](https://github.com/monounity/karma-typescript/tree/master/example-project%40angularjs)
- [mocha](https://github.com/monounity/karma-typescript/tree/master/example-project%40mocha)
- [Gulp](https://github.com/monounity/karma-typescript/tree/master/integration-tests%40gulp)

##### other examples
- Typescript [1.8.10 to 2.0.0^](https://github.com/monounity/karma-typescript/tree/master/example-project)
- Typescript [1.6.2 to 1.7.5](https://github.com/monounity/karma-typescript/tree/master/example-project@1.6.2)
- Typescript [1.8.10](https://github.com/monounity/karma-typescript/tree/master/integration-tests@1.8.10/src)
- Typescript [@latest](https://github.com/monounity/karma-typescript/tree/master/integration-tests@latest/src)


##### Example output
<img src="http://i.imgur.com/sc4Mswh.png" width="580" height="280" />

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

## Troubleshooting

### Error: Cannot find module 'buffer/' from '.'

This error seems to hit mostly users with older versions of `npm`, where all dependencies won't get pulled in automatically by `npm`.

There's a workaround reported by users, which is simply adding the missing dependencies explicitly to `package.json`:

 * `npm install --save-dev browser-resolve`
 * `npm install --save-dev detective`
 * `npm install --save-dev buffer`
 * `npm install --save-dev process`


You could also try running `npm install` twice or, if possible, upgrade to a newer version of `npm`.

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

© 2016 Erik Barke, Monounity

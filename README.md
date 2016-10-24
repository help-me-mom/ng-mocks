# karma-typescript

## What the plugin does

The plugin seamlessly runs your unit tests written in Typescript and creates coverage reports, eliminating the need for additional build steps or scripts.

Here's a screenshot of coverage created with `karma-typescript`:

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


[Runnable example](https://github.com/monounity/karma-typescript/tree/master/example-project)

## Under the hood

Under the hood, `karma-typescript` chains several other useful plugins and configures them with sensible defaults, in the following order:

|Module|Step|Note|
|---|---|---|
|`typescript`|Transpile to in-memory with inline sourcemaps|{ target: "es5", module: "commonjs", sourceMap: true}|
|`karma-commonjs`|Add module loading for browsers||
|`karma-coverage`|Instrument the code with Istanbul| coverageReporter: { instrumenterOptions: istanbul: { noCompact: true }}, *.spec.ts and &ast;.test.ts are excluded|
|`remap-istanbul`|Create remapped coverage|karmaTypescriptConfig.reports :{{ html: "coverage" }}|

## Importing stylesheets and bundling

Style files (.css|.less|.sass|.scss) are served as dummy modules to the browser running the tests, allowing you to load styles using the Typescript `import` statement, ie `import "./style/app";`.

This means you can import styles in order to let, for instance, `webpack` load the styles with  `sass-loader` or `less-loader` etc for bundling later on, without breaking the unit test runner.

## Advanced configuration

If the defaults aren't enough, `karma-typescript` is both configurable and steps aside if it detects that you've added `karma-commonjs` or `karma-coverage` to the Karma config yourself.

Here are the report and remapping options for karma-typescript:

```javascript
karmaTypescriptConfig: {
    /*
        Report type options passed to remap-istanbul.
        The key is the report type, the value is the destination path.
    */
    reports:
    {
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
    },
    /* Options passed to remap-istanbul */
    remapOptions:
    {
        // Regex or string for excluding files
        exclude: /\.(spec|test)\.ts/,
        // Function for handling warning messages
        warn: function(message){}
    }
}
```

It is also possible to add options for `karma-coverage` in the `coverageReporter` section. In the next example, a TeamCity report is created with `karma-coverage` and `karma-typescript` is used as an on-the-fly transpiler and reporter. The plugin doesn't run the `karma-commonjs` and `karma-coverage` plugins since they're specified in the configuration and will be run by Karma:

```javascript
frameworks: ["jasmine", "commonjs"],

files: [
    { pattern: "src/**/*.ts" }
],

preprocessors: {
    "**/*.ts": ["karma-typescript", "commonjs", "coverage"]
},

reporters: ["progress", "karma-typescript", "coverage"],

// For more options, see https://github.com/karma-runner/karma-coverage
coverageReporter: {
    type: "teamcity", file: "teamcity.txt"
},

browsers: ["PhantomJS"]
```

If you want to debug your code and see the original TypeScript code, you can disable code coverage instrumentation using this configuration:

```javascript
karmaTypescriptConfig: {
    disableCodeCoverageInstrumentation: true
}
```

## Requirements

Typescript >=1.6 is required.

Note: Typescript >= 1.8.10 produces more accurate test coverage remapping.

## Licensing

This software is licensed with the MIT license.

© 2016 Monounity

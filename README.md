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

|Module|Step|Settings|
|---|---|---|
|`typescript`|Transpile to in-memory with inline sourcemaps|{ target: "es5", module: "commonjs", sourceMap: true}|
|`karma-commonjs`|Add module loading for browsers||
|`karma-coverage`|Instrument the code with Istanbul||
|`remap-istanbul`|Create remapped coverage|{ html: "coverage" } (.spec.ts and .test.ts excluded)|

## Advanced configuration

If the defaults aren't enough, `karma-typescript` is both configurable and steps aside if it detects that you've added `karma-commonjs` or `karma-coverage` to the Karma config yourself.

Here are the report and remapping options for karma-typescript:

```javascript
karmaTypescriptConfig: {
    /* Report type options passed to remap-istanbul */
    reports:
    {
        "clover": "coverage",
        "cobertura": "coverage",
        "html": "coverage",
        "json-summary": "coverage",
        "json": "coverage",
        "lcovonly": "coverage",
        "teamcity": "coverage",
        "text-lcov": "coverage",
        "text-summary": "coverage",
        "text": "coverage"
    },
    /* Options passed to remap-istanbul */
    remapOptions:
    {
        // Regex or string for excluding files, the example below is default
        exclude: /\.(spec|test)\.ts/,
        // Function for warning messages, these warnings are silent by default
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

## Requirements

Typescript >=1.6 is required.

## Licensing

This software is licensed with the MIT license.

© 2016 Monounity

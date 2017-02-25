# karma-typescript-angular2-transform

[![Npm version](https://img.shields.io/npm/v/karma-typescript-angular2-transform.svg)](https://www.npmjs.com/package/karma-typescript-angular2-transform)
[![Travis build status](https://travis-ci.org/monounity/karma-typescript-angular2-transform.svg?branch=2.1.8)](https://travis-ci.org/monounity/karma-typescript-angular2-transform)

> :rocket: [karma-typescript](https://github.com/monounity/karma-typescript) plugin for transforming template and style urls in Angular2 components.

This plugin rewrites relative urls in the `templateUrl` and `styleUrls` properties of Angular2 components,
making sure that the Angular framework can resolve the urls when running tests with [karma-typescript](https://github.com/monounity/karma-typescript), eliminating the need to use `module.id` for resolving paths.

The absolute urls are calculated using the `basePath` and `urlRoot` properties in `karma.conf.js`.

## Installation

```
$ npm install --save-dev karma-typescript-angular2-transform
```

## Configuration

In the `karma-typescript` section of `karma.conf.js`:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            require("karma-typescript-angular2-transform")
        ]
    }
}
```

## Example code

```javascript
import { Component } from import { Component } from "@angular/core";

@Component({
    selector: "app-mock",
    styleUrls: ["style.css", "./style.less", "../style.scss"],
    templateUrl: "mock.html"
})
export class MockComponent {}
```

## Licensing

This software is licensed with the MIT license.

© 2016-2017 Erik Barke, Monounity

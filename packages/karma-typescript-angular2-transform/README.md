# karma-typescript-angular2-transform

<a href="https://www.npmjs.com/package/karma-typescript-angular2-transform"><img alt="Npm Version" src="https://img.shields.io/npm/v/karma-typescript-angular2-transform.svg"></a>
<a href="https://www.npmjs.com/package/karma-typescript-angular2-transform"><img alt="Npm Total Downloads" src="https://img.shields.io/npm/dt/karma-typescript-angular2-transform.svg"></a>
<a href="https://travis-ci.org/monounity/karma-typescript"><img alt="Travis Status" src="https://img.shields.io/travis/monounity/karma-typescript/master.svg?label=travis"></a>
<a href="https://ci.appveyor.com/project/monounity/karma-typescript"><img alt="Appveyor Status" src="https://img.shields.io/appveyor/ci/monounity/karma-typescript/master.svg?label=appveyor"></a>

> Karma-Typescript :heart: Angular

This plugin rewrites relative urls in the `templateUrl` and `styleUrls` properties of Angular components,
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

© 2016-2021 Erik Barke, Monounity

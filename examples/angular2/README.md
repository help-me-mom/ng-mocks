# Angular2

This project contains runnable sample code and configuration for unit testing
Typescript on the fly in Karma with Angular2 and Istanbul coverage.

## Installation

```
npm install karma-typescript
cd node_modules/karma-typescript/examples/angular2
npm install
```

## Running

```
npm test
```

## Angular @Components

There are several ways to make `Angular` resolve absolute and relative urls in the `templateUrl`
and `styleUrls` properties of a component. 

### Using karma-typescript-angular2-transform:

This project is configured to use the plugin
[karma-typescript-angular2-transform](https://github.com/monounity/karma-typescript-angular2-transform)
which rewrites relative urls to absolute urls on the fly in the bundling step before running the tests.
This covers most scenarios including bundling for production with `webpack`.

In `karma.conf.js`:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        transforms: [
            require("karma-typescript-angular2-transform")
        ]
    }
}
```

Component decorator:
```javascript
@Component({
    templateUrl: "hello.html"
    // ...other properties
})
```

### Using absolute paths + Karma proxies:

In `karma.conf.js`:

```javascript
proxies: {
    "/app/": "/base/src/app/"
}
```

Component decorator:
```javascript
@Component({
    templateUrl: "app/hello.html"
    // ...other properties
})
```

## Bundler entrypoints

When unit testing Angular2 applications it is crucial that the `TestBed` has finished setting
up the test environment before any actual code is executed. This is necessary in order to avoid
intermittent crashes caused by race conditions due to application code being executed before the test code.

By default, `karma-typescript` considers all `.ts` files specified in `karma.conf.js` to be entrypoints
and will execute them in the order they are specified.

This behavior can be overridden by specifying which files are considered entrypoints
with a regular expression in the bundler configuration section:

```javascript
karmaTypescriptConfig: {
    bundlerOptions: {
        entrypoints: /\.spec\.ts$/ 
    }
}
```

## Licensing

This software is licensed with the MIT license.

© 2016-2017 Erik Barke, Monounity

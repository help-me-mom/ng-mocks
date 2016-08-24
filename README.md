# karma-typescript
This is a preprocessor for transpiling [Typescript](https://www.typescriptlang.org/) on the fly for unit testing with Karma.

The distribution includes runnable examples for unit testing Typescript files transpiled to the [CommonJS](https://en.wikipedia.org/wiki/CommonJS) and the [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) module format.

### Sourcemaps
Sourcemaps can optionally be created for debugging the original Typescript code, instead of the transpiled code, when running tests in a web browser.

### Project tsconfig.json
If specified, the preprocessor will load a tsconfig.json file, relative to the directory the test are run from, and merge the Typescript compiler options with the preprocessor options.

Note: the preprocessor options will override the tsconfig.json options.

### Npm installation:
`npm install karma-typescript --save-dev`

### Configuration

The `karmaTypescript` configuration section is optional, if left out the files will be transpiled using the compiler default options.

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

### Example project using Jasmine with CommonJS + sourcemaps:

The runnable example for CommonJS is located in the folder `example-project-commonjs`.

In the example, the .ts files are transpiled to the `es5` standard with CommonJS module format and sourcemaps, and then run through the karma-commonjs preprocessor for module loading.

To run the example test, issue the following commands:

```
cd example-project-commonjs
npm install
npm test
```

This should run the example unit test in Chrome, with sourcemaps available if you press the button `debug` in the browser window.

### Example project using Jasmine with AMD/RequireJS + sourcemaps:

The runnable example for AMD is located in the folder `example-project-amd`.

In the example, the .ts files are transpiled to the `es5` standard with AMD module format and sourcemaps, and then files and modules are loaded by the karma-requirejs preprocessor in `test-main.js`.

To run the example test, issue the following commands:

```
cd example-project-amd
npm install
npm test
```

This should run the example unit test in Chrome, with sourcemaps available if you press the button `debug` in the browser window.

### Examples breakdown
The unit test (the same in both examples) showcases module loading by using `import` but is still as simple as it gets; it imports the class to be tested and an interface required by the class. The interface is mocked, the class is instantiated and then the method `sayHello` is tested:

```javascript
import { IHelloService } from './hello-service.interface';
import { HelloComponent } from './hello.component';

class MockHelloService implements IHelloService {

    public sayHello(): string {
        return 'hello world!';
    }
}

describe('HelloComponent', () => {

    it('should say "hello world!"', () => {

        let mockHelloService = new MockHelloService();
        let helloComponent = new HelloComponent(mockHelloService);

        expect(helloComponent.sayHello()).toEqual('hello world!');
    });
});
```
Essential parts of karma.conf.js for CommonJS module format:

```javascript
frameworks: ['jasmine', 'commonjs'],

files: [
    { pattern: 'src/**/*.ts' }
],

preprocessors: {
    '**/*.ts': ['karma-typescript', 'commonjs']
},

karmaTypescript: {
    tsconfigPath: 'tsconfig.json',
    options: {
        sourceMap: true,
        target: 'es5',
        module: 'commonjs'
    }
}
```

Essential parts of karma.conf.js for AMD module format:

```javascript
frameworks: ['jasmine', 'requirejs'],

files: [
    'test-main.js',
    { pattern: 'src/**/*.ts', included: false }
],

preprocessors: {
    '**/*.ts': ['karma-typescript']
},

karmaTypescript: {
    tsconfigPath: 'tsconfig.json',
    options: {
        sourceMap: true,
        target: 'es5',
        module: 'amd'
    }
}
}
```

If you inspect the tsconfig.json file you will see that the sourceMap option in karma.conf.js, in both examples, overrides the sourceMap option in the tsconfig.json.

### Licensing

This software is licensed with the MIT license.

© 2016 Monounity

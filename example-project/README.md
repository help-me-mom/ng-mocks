# Runnable example using Jasmine with CommonJS + sourcemaps:

In this example, the Typescript files are transpiled to the `es5` standard with [CommonJS](https://en.wikipedia.org/wiki/CommonJS) module format and sourcemaps, and then run through the [karma-commonjs](https://github.com/karma-runner/karma-commonjs) preprocessor for module loading.

To run the example test, issue the following commands:

```
npm install karma-typescript
cd node_modules/karma-typescript/example-project-commonjs
npm install
npm test
```

This should run the example unit test in Chrome, with sourcemaps available if you press the button `debug` in the browser window.

Essential parts of karma.conf.js:

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

### Example breakdown
The unit test module loading by using `import` but is still as simple as it gets; it imports the class to be tested and an interface required by the class. The interface is mocked, the class is instantiated and then the method `sayHello` is tested:

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

## Licensing

This software is licensed with the MIT license.

© 2016 Monounity

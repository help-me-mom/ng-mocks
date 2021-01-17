[![chat on gitter](https://img.shields.io/gitter/room/ike18t/ng-mocks)](https://gitter.im/ng-mocks/community)
[![npm version](https://img.shields.io/npm/v/ng-mocks)](https://www.npmjs.com/package/ng-mocks)
[![build status](https://img.shields.io/travis/ike18t/ng-mocks/master)](https://travis-ci.org/github/ike18t/ng-mocks/branches)
[![coverage status](https://img.shields.io/coveralls/github/ike18t/ng-mocks/master)](https://coveralls.io/github/ike18t/ng-mocks?branch=master)
[![language grade](https://img.shields.io/lgtm/grade/javascript/g/ike18t/ng-mocks)](https://lgtm.com/projects/g/ike18t/ng-mocks/context:javascript)

# Mock components, services and more out of annoying dependencies in Angular tests

`ng-mocks` helps to:

- mock Components, Directives, Pipes, Modules, Services and Tokens
- facilitate boilerplate in tests
- access declarations via simple interface

The current version of the library **has been tested** and **can be used** with:

- Angular 11 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 10 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 9 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 8 (Jasmine, Jest, es5, es2015)
- Angular 7 (Jasmine, Jest, es5, es2015)
- Angular 6 (Jasmine, Jest, es5, es2015)
- Angular 5 (Jasmine, Jest, es5, es2015)

**Important links**

- [**Documentation with examples**](https://ng-mocks.sudo.eu)
- [GitHub repo](https://github.com/ike18t/ng-mocks)
- [NPM package](https://www.npmjs.com/package/ng-mocks)

* Live [example on StackBlitz](https://stackblitz.com/github/ng-mocks/examples?file=src/test.spec.ts)
* Live [example on CodeSandbox](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/test.spec.ts)

- [chat on gitter](https://gitter.im/ng-mocks/community)
- [**ask a question on Stackoverflow**](https://stackoverflow.com/questions/ask?tags=ng-mocks%20angular%20testing%20mocking)
- [report an issue on GitHub](https://github.com/ike18t/ng-mocks/issues/new)

## Very short introduction

```ts title="src/app.component.spec.ts"
describe('app-component', () => {
  // Mocking everything in AppModule except AppComponent
  beforeEach(() => MockBuilder(AppComponent, AppModule));

  // Mocking observables in dependencies
  beforeEach(() =>
    MockInstance(AuthService, () => ({
      isLoggedIn$: EMPTY,
      currentUser$: EMPTY,
    })),
  );

  it('should be created', () => {
    const fixture = MockRender(AppComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

Profit.

## Extra

Please support, if you like it:

- [give a star on GitHub](https://github.com/ike18t/ng-mocks)
- [share on twitter](https://twitter.com/intent/tweet?text=Check+ng-mocks+package&url=https%3A%2F%2Fgithub.com%2Fike18t%2Fng-mocks)

Thank you!

P.S. Feel free to [contact us](https://ng-mocks.sudo.eu/need-help) if you need help.

[![chat on gitter](https://img.shields.io/gitter/room/ike18t/ng-mocks)](https://gitter.im/ng-mocks/community)
[![npm version](https://img.shields.io/npm/v/ng-mocks)](https://www.npmjs.com/package/ng-mocks)
[![build status](https://img.shields.io/github/workflow/status/ike18t/ng-mocks/ci)](https://github.com/ike18t/ng-mocks/actions/workflows/ci.yaml?query=branch%3Amaster)
[![coverage status](https://img.shields.io/coveralls/github/ike18t/ng-mocks/master)](https://coveralls.io/github/ike18t/ng-mocks?branch=master)
[![language grade](https://img.shields.io/lgtm/grade/javascript/g/ike18t/ng-mocks)](https://lgtm.com/projects/g/ike18t/ng-mocks/context:javascript)

# Mock components, services and more out of annoying dependencies in Angular tests

`ng-mocks` helps to:

- mock Components, Directives, Pipes, Modules, Services and Tokens
- facilitate boilerplate in tests
- access declarations via simple interface

The current version of the library **has been tested** and **can be used** with:

- Angular 12 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 11 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 10 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 9 (Jasmine, Jest, Ivy, es5, es2015)
- Angular 8 (Jasmine, Jest, es5, es2015)
- Angular 7 (Jasmine, Jest, es5, es2015)
- Angular 6 (Jasmine, Jest, es5, es2015)
- Angular 5 (Jasmine, Jest, es5, es2015)

## Important links

- **[Documentation with examples](https://ng-mocks.sudo.eu)**
- [CHANGELOG](https://github.com/ike18t/ng-mocks/blob/master/CHANGELOG.md)
- [GitHub repo](https://github.com/ike18t/ng-mocks)
- [NPM package](https://www.npmjs.com/package/ng-mocks)

* Live [example on StackBlitz](https://stackblitz.com/github/ng-mocks/examples?file=src/test.spec.ts)
* Live [example on CodeSandbox](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/test.spec.ts)

- [chat on gitter](https://gitter.im/ng-mocks/community)
- **[ask a question on Stackoverflow](https://stackoverflow.com/questions/ask?tags=ng-mocks%20angular%20testing%20mocking)**
- [report an issue on GitHub](https://github.com/ike18t/ng-mocks/issues/new)

## Very short introduction

```ts title="src/app.component.spec.ts"
describe('app-component', () => {
  // We are going to test AppComponent.
  // Therefore, we want to mock its dependencies,
  // they are declared and imported in the module
  // where AppComponent has been declared too.
  // The next line says mock everything in AppModule,
  // but keep AppComponent as it is.
  beforeEach(() => {
    // The result of MockBuilder should be returned.
    return MockBuilder(AppComponent, AppModule);
  });

  // Stubbing observables in AuthService for all tests in the suite.
  beforeEach(() =>
    MockInstance(AuthService, () => ({
      isLoggedIn$: EMPTY,
      currentUser$: EMPTY,
    })),
  );

  it('should be created and initialized', () => {
    // Creating a spy on the 'check' method of the service.
    // MockInstance allows to spy / stub properties and methods
    // of declarations and providers before their instances
    // have been initialized.
    const spyCheck = MockInstance(
      AuthService,
      'check',
      jasmine.createSpyObj('AuthService.check'),
    ).and.returnValue(true);

    const fixture = MockRender(AppComponent);
    // Checking that the component has been created.
    expect(fixture.point.componentInstance).toBeDefined();
    // Checking that its ngOnInit method calls 'check' of the service.
    expect(spyCheck).toHaveBeenCalled();
  });
});
```

Profit.

## Extra

Please support, if you like it:

- [give a star on GitHub](https://github.com/ike18t/ng-mocks)
- [share on twitter](https://twitter.com/intent/tweet?text=Check%20ng-mocks%20package%20%23angular%20%23testing%20%23mocking&url=https%3A%2F%2Fgithub.com%2Fike18t%2Fng-mocks)

Thank you!

P.S. Feel free to [contact us](https://ng-mocks.sudo.eu/need-help) if you need help.

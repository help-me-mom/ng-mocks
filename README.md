[![chat on gitter](https://img.shields.io/gitter/room/ike18t/ng-mocks)](https://gitter.im/ng-mocks/community)
[![npm version](https://img.shields.io/npm/v/ng-mocks)](https://www.npmjs.com/package/ng-mocks)
[![build status](https://img.shields.io/circleci/build/github/ike18t/ng-mocks/master)](https://app.circleci.com/pipelines/github/ike18t/ng-mocks?branch=master)
[![coverage status](https://img.shields.io/coveralls/github/ike18t/ng-mocks/master)](https://coveralls.io/github/ike18t/ng-mocks?branch=master)
[![language grade](https://img.shields.io/lgtm/grade/javascript/g/ike18t/ng-mocks)](https://lgtm.com/projects/g/ike18t/ng-mocks/context:javascript)

# Mock components, services and more out of annoying dependencies in Angular tests

`ng-mocks` helps to:

- mock Components, Directives, Pipes, Modules, Services and Tokens
- facilitate boilerplate in tests
- access declarations via simple interface

The current version of the library **has been tested** and **can be used** with:

| Angular | ng-mocks | Jasmine | Jest | Ivy | es5 | es2015 |
| ------: | :------: | :-----: | :--: | :-: | :-: | :----: |
|      12 |  latest  |   yes   | yes  | yes | yes |  yes   |
|      11 |  latest  |   yes   | yes  | yes | yes |  yes   |
|      10 |  latest  |   yes   | yes  | yes | yes |  yes   |
|       9 |  latest  |   yes   | yes  | yes | yes |  yes   |
|       8 |  latest  |   yes   | yes  |     | yes |  yes   |
|       7 |  latest  |   yes   | yes  |     | yes |  yes   |
|       6 |  latest  |   yes   | yes  |     | yes |  yes   |
|       5 |  latest  |   yes   | yes  |     | yes |  yes   |

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

Global configuration for mocks in `src/test.ts`.
In case of jest `src/setupJest.ts` should be used.

```ts title="src/test.ts"
// All methods in mock declarations and providers
// will be automatically spied on their creation.
// https://ng-mocks.sudo.eu/extra/auto-spy
ngMocks.autoSpy('jasmine'); // or jest

// ngMocks.defaultMock helps to customize
// mock declarations and providers globally.
// Here it stubs observables in AuthService.
// Therefore, we don't need to stub them every time
// in a test once we want to supress their logic.
// https://ng-mocks.sudo.eu/api/ngMocks/defaultMock
ngMocks.defaultMock(AuthService, () => ({
  isLoggedIn$: EMPTY,
  currentUser$: EMPTY,
}));
```

An example of a spec with tests.

```ts title="src/app.component.spec.ts"
// We are going to test AppComponent.
// Therefore, we want to mock its dependencies.
// Usually, they are declared and imported in the module
// where AppComponent has been declared too.
//
// Apart from that, we want to speed up tests,
// because TestBed will be the same for all tests
// in this suite.
describe('app-component', () => {
  // Allows to use MockBuilder and MockRender
  // in beforeAll and helps to avoid recreation
  // of the same TestBed for every test.
  // https://ng-mocks.sudo.eu/api/ngMocks/faster
  ngMocks.faster();

  // The next line says mock everything in AppModule,
  // but keep AppComponent as it is.
  beforeAll(() => {
    // The result of MockBuilder should be returned.
    // https://ng-mocks.sudo.eu/api/MockBuilder
    return MockBuilder(AppComponent, AppModule);
  });

  // MockInstance helps to customize
  // mock declarations and providers.
  beforeEach(() => {
    // A spy on a method which returns children.
    // When an instance of ChildComponent is being created,
    // the method will be replaced with the spy.
    // https://ng-mocks.sudo.eu/api/MockInstance
    MockInstance(
      ChildComponent,
      'list',
      jasmine.createSpy(),
    ).and.returnValue([]);
  });

  it('should be created and initialized', () => {
    // Creating a spy on the 'check' method of the service.
    // MockInstance allows to spy / stub properties and methods
    // of declarations and providers before their instances
    // have been initialized.
    // https://ng-mocks.sudo.eu/api/MockInstance
    const spyCheck = MockInstance(
      AuthService,
      'check',
      jasmine.createSp('AuthService.check'),
    ).and.returnValue(true);

    // MockRender creates a wrapper component with
    // a template like <app-root ...allInputs></app-root>
    // and renders it.
    // It helps to assert lifecycle hooks.
    // https://ng-mocks.sudo.eu/api/MockRender
    const fixture = MockRender(AppComponent);

    // Checking that the component has been created.
    expect(fixture.point.componentInstance).toBeDefined();

    // Checking that its ngOnInit method
    // has called 'check' on AuthService.
    expect(spyCheck).toHaveBeenCalled();
  });

  it('verifies ctrl+s hot key', () => {
    // A spy on save calls.
    const spyCheck = MockInstance(
      StorageService,
      'save',
      jasmine.createSpy('StorageService.save'),
    );

    // A fake user data we want to save.
    const user = {
      id: 1,
      name: 'Foo Bar',
    };

    // Rendering
    // <app-root [user]="params.user"></app-root>.
    // https://ng-mocks.sudo.eu/api/MockRender
    const fixture = MockRender(AppComponent, { user });

    // Let's assume, there is host listener
    // for keyboard combination of ctrl+s
    // on AppComponent and we want to trigger it.
    // https://ng-mocks.sudo.eu/api/ngMocks/trigger
    ngMocks.trigger(fixture.point, 'keyup.control.s');

    // The spy should be called with the user.
    expect(spyCheck).toHaveBeenCalledWith(user);
  });

  it('verifies state of save button', () => {
    // Params for inputs and outputs
    // of AppComponent.
    const params = {
      allowCheck: false,
      click: jasmine.createSpy('click'),
    };

    // If [allowCheck] is an input and
    // (user) is an output of AppComponent,
    // then MockRender creates a wrapper component
    // with a template like:
    //
    // <app-root
    //   [allowCheck]="params.allowCheck"
    //   (click)="params.click($event)"
    // ></app-root>
    //
    // And renders it.
    // https://ng-mocks.sudo.eu/api/MockRender
    const fixture = MockRender(AppComponent, params);

    // The button should be disabled
    // when params.allowCheck = false.
    // https://ng-mocks.sudo.eu/api/ngMocks/find
    expect(ngMocks.find('button.check').disabled).toEqual(true);

    // Enabling the button.
    params.allowCheck = true;
    fixture.detectChanges();
    expect(ngMocks.find('button.check').disabled).toEqual(false);

    // Clicking the button
    // in order to trigger the output.
    // https://ng-mocks.sudo.eu/api/ngMocks/click
    ngMocks.click('button.check');

    // The spy in params.click
    // should be notified about the click.
    expect(params.click).toHaveBeenCalled();
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

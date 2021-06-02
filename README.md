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

| Angular | ng-mocks | Jasmine | Jest | Ivy |
| ------: | :------: | :-----: | :--: | :-: |
|      12 |  latest  |   yes   | yes  | yes |
|      11 |  latest  |   yes   | yes  | yes |
|      10 |  latest  |   yes   | yes  | yes |
|       9 |  latest  |   yes   | yes  | yes |
|       8 |  latest  |   yes   | yes  |     |
|       7 |  latest  |   yes   | yes  |     |
|       6 |  latest  |   yes   | yes  |     |
|       5 |  latest  |   yes   | yes  |     |

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

// ngMocks.defaultMock helps to customize mocks
// globally. Therefore, we can avoid copy-pasting
// among tests.
// https://ng-mocks.sudo.eu/api/ngMocks/defaultMock
ngMocks.defaultMock(AuthService, () => ({
  isLoggedIn$: EMPTY,
  currentUser$: EMPTY,
}));
```

An example of a spec with for a login form component.

```ts title="src/form.component.spec.ts"
// Let's imagine that there is a ProfileComponent
// and it has 3 text fields: email, firstName,
// lastName, and a user can edit them.
// In the following test suite, we would like to
// cover behavior of the component.
describe('profile', () => {
  // First of all, we want to avoid creation of
  // the same TestBed for every test, because it
  // is not going to be changed from test to test.
  // https://ng-mocks.sudo.eu/api/ngMocks/faster
  ngMocks.faster();

  // Let's configure TestBed via MockBuilder.
  // The code below says to mock everything in
  // ProfileModule except ProfileComponent and
  // ReactiveFormsModule.
  beforeAll(() => {
    // The result of MockBuilder should be returned.
    // https://ng-mocks.sudo.eu/api/MockBuilder
    return MockBuilder(
      ProfileComponent,
      ProfileModule,
    ).keep(ReactiveFormsModule);
  });

  // A test to ensure that ProfileModule imports
  // and declares all dependencies.
  it('should be created', () => {
    // MockRender creates a wrapper component with
    // a template like
    // <app-root ...allInputs></profile>
    // and renders it.
    // It also respects all lifecycle hooks.
    // https://ng-mocks.sudo.eu/api/MockRender
    const fixture = MockRender(ProfileComponent);

    expect(
      fixture.point.componentInstance,
    ).toEqual(jasmine.any(ProfileComponent));
  });

  // A test to ensure that the component listens
  // on ctrl+s hotkey.
  it('saves on ctrl+s hot key', () => {
    // A fake profile.
    const profile = {
      email: 'test2@email.com',
      firstName: 'testFirst2',
      lastName: 'testLast2',
    };

    // A spy to track save calls.
    // MockInstance helps to configure mock things
    // before their initialization and usage.
    // https://ng-mocks.sudo.eu/api/MockInstance
    const spySave = MockInstance(
      StorageService,
      'save',
      jasmine.createSpy('StorageService.save'),
    );

    // Renders <profile [profile]="params.profile">
    // </profile>, and supports onPush components.
    // https://ng-mocks.sudo.eu/api/MockRender
    const { point } = MockRender(
      ProfileComponent,
      { profile },
    );

    // Let's put a random email in the text field
    // for email addresses.
    // https://ng-mocks.sudo.eu/api/ngMocks/change
    ngMocks.change(
      '[name=email]',
      'test3@em.ail',
    );

    // Let's ensure that nothing has been called.
    expect(spySave).not.toHaveBeenCalled();

    // Let's assume that there is a host listener
    // for a keyboard combination of ctrl+s,
    // and we want to trigger it.
    // https://ng-mocks.sudo.eu/api/ngMocks/trigger
    ngMocks.trigger(point, 'keyup.control.s');

    // The spy should be called with the user
    // and the random email address.
    expect(spySave).toHaveBeenCalledWith({
      email: 'test3@em.ail',
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
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

---
title: Mock components, services and more out of annoying dependencies in Angular tests
description: An Angular testing library for creating mock services, components, directives,
  pipes and modules in unit tests, which includes shallow rendering
  and supports jasmine and jest.
sidebar_label: Get started
slug: /
---

[![chat on gitter](https://img.shields.io/gitter/room/ike18t/ng-mocks)](https://gitter.im/ng-mocks/community)
[![npm version](https://img.shields.io/npm/v/ng-mocks)](https://www.npmjs.com/package/ng-mocks)
[![build status](https://img.shields.io/travis/ike18t/ng-mocks/master)](https://travis-ci.org/github/ike18t/ng-mocks/branches)
[![coverage status](https://img.shields.io/coveralls/github/ike18t/ng-mocks/master)](https://coveralls.io/github/ike18t/ng-mocks?branch=master)
[![language grade](https://img.shields.io/lgtm/grade/javascript/g/ike18t/ng-mocks)](https://lgtm.com/projects/g/ike18t/ng-mocks/context:javascript)

`ng-mocks` is a testing library which helps with
**mocking [services](api/MockService.md),
[components](api/MockComponent.md)**,
[directives](api/MockDirective.md),
[pipes](api/MockPipe.md) and
[modules](api/MockModule.md)
in tests for Angular applications.
When we have a **noisy child component**,
or any other **annoying dependency**,
`ng-mocks` has tools to turn these declarations into their mocks,
keeping interfaces as they are, but suppressing their implementation.

The current version of `ng-mocks` has been tested and **can be used** with:

|  Angular |                           ng-mocks                            | Jasmine | Jest | Ivy |
| -------: | :-----------------------------------------------------------: | :-----: | :--: | :-: |
|       13 |                            latest                             |   yes   | yes  | yes |
|       12 |                            latest                             |   yes   | yes  | yes |
|       11 |                            latest                             |   yes   | yes  | yes |
|       10 |                            latest                             |   yes   | yes  | yes |
|        9 |                            latest                             |   yes   | yes  | yes |
|        8 |                            latest                             |   yes   | yes  |     |
|        7 |                            latest                             |   yes   | yes  |     |
|        6 |                            latest                             |   yes   | yes  |     |
|        5 |                            latest                             |   yes   | yes  |     |

In the header menu we can find **preconfigured sandboxes**, where we could **check all the features**.
To focus on a particular one, simply prefix it with `fdescribe` or `fit`.

Also, there is a brief summary with **the latest changes** in [CHANGELOG](https://github.com/ike18t/ng-mocks/blob/master/CHANGELOG.md).

## Quick Navigation

- [How to read this manual](./tl-dr.md)
- [Making tests faster](./api/ngMocks/faster.md)
- [Autospy everything](./extra/auto-spy.md)
- [Testing inputs, outputs and lifecycle hooks](./api/MockRender.md)
- [Mocking methods in components before their initialization](./api/MockInstance.md)

## Very short introduction

Global configuration for mocks in `src/test.ts`.
In case of jest `src/setup-jest.ts` should be used.

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

An example of a spec for a profile edit component.

```ts title="src/profile.component.spec.ts"
// Let's imagine that there is a ProfileComponent
// and it has 3 text fields: email, firstName,
// lastName, and a user can edit them.
// In the following test suite, we would like to
// cover behavior of the component.
describe('profile:classic', () => {
  // First of all, we would like to reuse the same
  // TestBed in every test.
  // ngMocks.faster suppresses reset of TestBed
  // after each test and allows to use TestBed,
  // MockBuilder and MockRender in beforeAll.
  // https://ng-mocks.sudo.eu/api/ngMocks/faster
  ngMocks.faster();

  // Helps to reset customizations after each test.
  MockInstance.scope();

  // Let's declare TestBed in beforeAll
  // instead of beforeEach.
  // The code mocks everything in SharedModule
  // and provides a mock AuthService.
  beforeAll(async () => {
    return TestBed.configureTestingModule({
      imports: [
        MockModule(SharedModule), // mock
        ReactiveFormsModule, // real
      ],
      declarations: [
        MockComponent(AvatarComponent), // mock
        ProfileComponent, // real
      ],
      providers: [
        MockProvider(AuthService), // mock
      ],
    }).compileComponents();
  });

  // A test to ensure that ProfileComponent
  // can be created.
  it('should be created', () => {
    // MockRender is an advanced version of
    // TestBed.createComponent.
    // It respects all lifecycle hooks,
    // onPush change detection, and creates a
    // wrapper component with a template like
    // <app-root ...allInputs></profile>
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
    // MockInstance helps to configure mock
    // providers, declarations and modules
    // before their initialization and usage.
    // https://ng-mocks.sudo.eu/api/MockInstance
    const spySave = MockInstance(
      StorageService,
      'save',
      jasmine.createSpy(), // or jest.fn()
    );

    // Renders <profile [profile]="params.profile">
    // </profile>.
    // https://ng-mocks.sudo.eu/api/MockRender
    const { point } = MockRender(
      ProfileComponent,
      { profile }, // bindings
    );

    // Let's change the value of the form control
    // for email addresses with a random value.
    // ngMocks.change finds a related control
    // value accessor and updates it properly.
    // https://ng-mocks.sudo.eu/api/ngMocks/change
    ngMocks.change(
      '[name=email]', // css selector
      'test3@em.ail', // an email address
    );

    // Let's ensure that nothing has been called.
    expect(spySave).not.toHaveBeenCalled();

    // Let's assume that there is a host listener
    // for a keyboard combination of ctrl+s,
    // and we want to trigger it.
    // ngMocks.trigger helps to emit events via
    // simple interface.
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

## Extra

If you like `ng-mocks`, please support it:

- [with a star on GitHub](https://github.com/ike18t/ng-mocks)
- [with a tweet](https://twitter.com/intent/tweet?text=Check%20ng-mocks%20package%20%23angular%20%23testing%20%23mocking&url=https%3A%2F%2Fgithub.com%2Fike18t%2Fng-mocks)

Thank you!

P.S. Feel free to [contact us](./need-help.md) if you need help.

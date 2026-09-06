---
title: How to update to the latest version of ng-mocks
description: Critical changes to consider during an updating process to the latest version of ng-mocks
sidebar_label: Updating to the latest
---

Usually, you can use the latest version of `ng-mocks` with any [Angular 5+ application](index.md).

Below you can find critical changes. Most of them happen on major releases.
Bug fixes which can affect tests that relied on the previous behavior are listed too.

If you are facing an issue, despite the instructions, please, feel free to [contact us](need-help.md).

## Next ng-mocks release: existing mock instances

In `ng-mocks` 14.17.5 and earlier, [`MockInstance`](api/MockInstance.md) only configured mocks before their creation.
With the implementation of [#2713](https://github.com/help-me-mom/ng-mocks/issues/2713), class-based customizations
also update existing live mocks immediately, preserving their identity.

Previously, a late registration left this existing mock unchanged:

```ts
const fixture = TestBed.createComponent(ProfileComponent);
const user = fixture.componentInstance.user;
MockInstance(UserService, 'getName', () => 'Alice');
// user.getName still used its previous implementation.
```

After updating, the same registration changes the existing mock:

```ts
const fixture = TestBed.createComponent(ProfileComponent);
const user = fixture.componentInstance.user;
MockInstance(UserService, 'getName', () => 'Alice');
expect(user.getName()).toEqual('Alice');
```

Review registrations made after injecting a mock or creating a component. Callbacks now execute immediately for
each existing instance as well as once for future instances. If a callback references test data, initialize that
data before registering the callback. If an existing instance must retain its behavior, register the customization
after destroying that instance or put the scenarios in separate tests with normal TestBed teardown.
Use `ngMocks.stubMember(instance, ...)` when only one particular object should change.

Customizations still need to precede the behavior under test. Constructors and field initializers have already
run when `TestBed.createComponent` returns. The first change-detection pass runs `ngOnInit`; a later customization
does not rerun it or update values it already copied. Existing subscriptions are unaffected.

`MockInstance.restore()`, `MockInstance(Class)`, and `MockReset()` continue to reset configuration for future
instances without undoing mutations on existing objects. Tests using `ngMocks.faster()` to preserve instances
must explicitly set the state needed by each test.

Existing before-creation usage remains supported. Injection-token replacement, real/kept instances, direct
`MockService` results, and explicit `useValue` providers are unaffected by live-instance tracking.

## From ng-mocks 14.15 to 14.16

### Signal inputs of mocked components

Starting with `14.16.0`, [`MockComponent`](api/MockComponent.md) and component mocks created by
[`MockBuilder`](api/MockBuilder.md) preserve inputs declared with `input()` or `input.required()` as Angular signals.
Previously, a bound signal input on a mocked component was incorrectly replaced with its plain value. The change fixes
[#13671](https://github.com/help-me-mom/ng-mocks/issues/13671) and makes mocked and kept components expose the same
input interface. Input aliases, required-input metadata and transforms are preserved too.

This is an observable behavior change for Angular 17+ tests which relied on the old mock-only behavior. For example,
this assertion could pass before `14.16.0` even though `name` is declared as a signal:

```ts
const child = ngMocks.findInstance(ChildComponent);

expect(child.name).toEqual('test');
```

Since `14.16.0`, read the signal as you would on the real component:

```ts
const child = ngMocks.findInstance(ChildComponent);

expect(child.name()).toEqual('test');
```

Before updating, check tests which access a mocked component through `componentInstance` or `ngMocks.findInstance`.
If a property is declared with `input()` or `input.required()`, update direct reads to call the signal. Do not assign a
value directly to the property. Change its parent binding and run change detection, or use Angular's
[`ComponentRef.setInput`](api/MockRender.md#componentrefsetinput-and-signal-inputs) when the component is rendered
directly.

For value-oriented assertions which should work both before and after `14.16.0`, use [`ngMocks.input`](api/ngMocks/input.md):

```ts
const child = ngMocks.find(ChildComponent);

expect(ngMocks.input(child, 'name')).toEqual('test');
```

No changes are needed for decorator-based `@Input()` properties. Kept components already exposed signal inputs as
signals, so this migration applies only when the declaration is replaced with a mock.

## From 21 to 22

There are no special cases.
The update should be straight forward.

## From 20 to 21

There are no special cases.
The update should be straight forward.

## From 19 to 20

There are no special cases.
The update should be straight forward.

## From 18 to 19

There are no special cases.
The update should be straight forward.

## From 17 to 18

There are no special cases.
The update should be straight forward.

## From 16 to 17

There are no special cases.
The update should be straight forward.

## From 15 to 16

There are no special cases.
The update should be straight forward.

## From 14 to 15

### `test.ts`

If you want to use global configuration and features like [`ngMocks.autoSpy`](./extra/auto-spy.md),
you need to add `test.ts` back to your project: [How to add ng-mocks to a fresh Angular 15 project](https://stackoverflow.com/questions/75320328/how-to-add-ng-mocks-to-a-fresh-angular-15-project/75323651#75323651)

### `RouterOutlet`

If you have been testing `RouterModule` using `MockRender(RouterOutlet)`, you need to add empty params to `MockRender`:

```ts
const fixture = MockRender(RouterOutlet, {});
```

## From 13 to 14

[`MockBuilder`](api/MockBuilder.md) becomes stricter and starts to throw errors on wrong configuration.
If you call [`MockBuilder`](api/MockBuilder.md) with 2 parameters and use the chain for dependencies:

```ts
beforeEach(() => {
  return MockBuilder(Declaration, ItsModule)
    .keep(Dep1)
    .mock(Dep2);
});
```

[`MockBuilder`](api/MockBuilder.md) throws an error
if `Dep1` or `Dep2` hasn't been imported or declared somewhere in `ItsModule` and its imports.

:::important
That has been done to let you know when one of dependencies is missing.
So, if a developer has removed `Dep2` from `ItsModule` you would get an error during CI instead of production.
:::

It's not recommended, but you can change this to `console.warn` or disable it.
For that, please change the config of `ng-mocks` in `src/test.ts`, `src/setup-jest.ts` or `src/test-setup.ts`:

```ts
ngMocks.config({
  onMockBuilderMissingDependency: 'warn', // or 'i-know-but-disable'
});
```

Usually, you need `Dep1` or `Dep2` which aren't imported in `ItsModule`,
when they are external dependencies, such as `MatDialogRef` or `ActivatedRoute`.
In this case, please add them explicitly to the params of `MockBuilder` instead of chain methods:

```ts
beforeEach(() => {
  return MockBuilder(
    // Things to keep and export.
    [Declaration, Dep1, MatDialogRef], // providing and keeping MatDialogRef
    // Things to mock and export.
    [ItsModule, Dep2, ActivatedRoute], // providing and mocking ActivatedRoute
  );
});
```

Please note, that if you call [`MockBuilder`](api/MockBuilder.md) with 0 or 1 parameters, all chained dependencies
are added to TestBed and exported by default now:

```ts
// It doesn't throw, allows access to Declaration, MatDialogRef, Dep2 and ItsModule in TestBed.
beforeEach(() => {
  return MockBuilder(Declaration)
    .mock(ItsModule)
    .keep(MatDialogRef)
    .mock(Dep2);
});

// It doesn't throw, allows access to Declaration, Dep1, ActivatedRoute and ItsModule in TestBed.
beforeEach(() => {
  return MockBuilder()
    .keep(Declaration)
    .mock(ItsModule)
    .keep(Dep1)
    .mock(ActivatedRoute);
});
```

## From 12 to 13

There are no special cases.
The update should be straight forward.

## From any old one to 12.4.0

Because of issues with the speed of merging a fix for `jest`, there is a braking change in `12.4.0`.

If you are using [`MockInstance`](api/MockInstance.md) in `beforeAll`, `beforeEach` or `it`,
and rely on automatic reset, then you have to perform extra configuration.
More information in the [How to install ng-mocks](extra/install.md#default-customizations)
and in [`MockInstance.scope`](api/MockInstance.md#scope) sections.

## From 11 to 12

The only breaking change is `auto-spy`.

[`ngMocks.autoSpy('jasmine')`](extra/auto-spy.md) and [`ngMocks.autoSpy('jest')`](extra/auto-spy.md)
should be used instead of `import 'ng-mocks/dist/jasmine';` and `import 'ng-mocks/dist/jest';`. 

## From 11.10 to 11.11 and higher

If you are facing an issue with `MockRender` and a thrown error about "Forgot to flush TestBed?",
you may want to suppress it instead of fixing, whereas fixing it is the right way.

In order to suppress the error, you need to upgrade to `12.0.1` at least, and to add in `test.ts`:

```ts
ngMocks.config({
  onTestBedFlushNeed: 'warn',
});
```

Then instead of throwing errors, `MockRender` will log them in console as warnings.

## From 10 to 11

#### MockModule

Now it does not export all mock imports and mock declarations,
but respects exports of modules.
The story is the same as in the [update from 8 to 9 for `MockBuilder.mock`](#from-mockmodule-to-mockbuildermock).

If you still need to export them,
then you should consider a migration of affected tests to [`MockBuilder`](api/MockBuilder.md) or [`ngMocks.guts`](api/ngMocks/guts.md).

#### MockHelper

`MockHelper` has been renamed to [`ngMocks`](api/ngMocks.md), please check its docs.

#### MockComponent

Previously, it had been accepting a `meta` parameter, now it has been removed.

[Contact us](need-help.md), if you are using this functionality.

#### Tokens

- `NG_GUARDS` has been renamed to [`NG_MOCKS_GUARDS`](api/MockBuilder.md#ng_mocks_guards-token)
- `NG_INTERCEPTORS` has been renamed to [`NG_MOCKS_INTERCEPTORS`](api/MockBuilder.md#ng_mocks_interceptors-token)

## From 9 to 10

There are no special cases.
The update should be straight forward.

## From 8 to 9

#### from MockModule to `MockBuilder.mock`

[`MockModule`](api/MockModule.md) exports all imports and declarations,
and [`MockBuilder.mock`](api/MockBuilder.md#mock) respects exports of modules.

This behavior allows tests to fail, if a declaration of a module has been changed,
and it does not export a dependency anymore. Likewise, an Angular application would fail too.

## From 7 to 8

There are no special cases.
The update should be straight forward.

## From 6 to 7

There are no special cases.
The update should be straight forward.

## From 5 to 6

There are no special cases.
The update should be straight forward.

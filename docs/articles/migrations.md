---
title: How to update to the latest version of ng-mocks
description: Critical changes to consider during an updating process to the latest version of ng-mocks
sidebar_label: Updating to the latest
---

Usually, you can use the latest version of `ng-mocks` with any [Angular 5+ application](index.md).

Below you can find critical changes. They happen on major releases.

If you are facing an issue, despite the instructions, please, feel free to [contact us](need-help.md).

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

- `NG_GUARDS` has been renamed to [`NG_MOCKS_GUARDS`](api/MockBuilder.md#ngmocksguards-token)
- `NG_INTERCEPTORS` has been renamed to [`NG_MOCKS_INTERCEPTORS`](api/MockBuilder.md#ngmocksinterceptors-token)

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

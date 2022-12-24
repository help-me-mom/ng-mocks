---
title: Testing Modules with BrowserAnimationsModule
description: Information and solutions how to test modules with BrowserAnimationsModule
sidebar_label: BrowserAnimationsModule
---

By default, Angular recommends replacing `BrowserAnimationsModule` with `NoopAnimationsModule` in unit tests.

In order to do so globally, you can use [`ngMocks.globalReplace`](/api/ngMocks/globalReplace.md):

```ts title="src/test.ts"
ngMocks.globalReplace(BrowserAnimationsModule, NoopAnimationsModule);
```

Now, every time `ng-mocks` sees `BrowserAnimationsModule`, it will substitute it with `NoopAnimationsModule`.

## MockBuilder

Please check how [`MockBuilder`](/api/MockBuilder.md) behaves in this case: 

```ts
// BrowserAnimationsModule is replaced by NoopAnimationsModule.
MockBuilder(MyComponent, MyModule);

// BrowserAnimationsModule will be kept as it is.
MockBuilder(MyComponent, MyModule).keep(BrowserAnimationsModule);

// BrowserAnimationsModule will be mocked, not replaced.
MockBuilder(MyComponent, MyModule).mock(BrowserAnimationsModule);

// BrowserAnimationsModule will be excluded from declarations.
MockBuilder(MyComponent, MyModule).exclude(BrowserAnimationsModule);
```

## ngMocks.guts

Please check how [`ngMocks.guts`](/api/ngMocks/guts.md) behaves in this case:

```ts
// BrowserAnimationsModule is replaced by NoopAnimationsModule.
ngMocks.guts(MyComponent, MyModule);

// BrowserAnimationsModule will be kept as it is.
ngMocks.guts([MyComponent, BrowserAnimationsModule], MyModule);

// BrowserAnimationsModule will be mocked, not replaced.
ngMocks.guts([MyComponent, MyModule], BrowserAnimationsModule);

// BrowserAnimationsModule will be excluded from declarations.
ngMocks.guts(MyComponent, MyModule, BrowserAnimationsModule);
```

## fakeAsync

A kept / mock `BrowserAnimationsModule` causes issues with `fakeAsync`.
Please open an issue on [GitHub](https://github.com/help-me-mom/ng-mocks/issues),
if you have a case where `NoopAnimationsModule` isn't a solution.

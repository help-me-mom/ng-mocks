---
title: Testing Modules with BrowserAnimationsModule
description: Information and solutions how to test modules with BrowserAnimationsModule
sidebar_label: BrowserAnimationsModule
---

By default, `ng-mocks` replaces `BrowserAnimationsModule` with `NoopAnimationsModule`.

However, it can be changed via [`MockBuilder`](../api/MockBuilder.md) or [`ngMocks.guts`](../api/ngMocks/guts.md)
when `NoopAnimationsModule` isn't a solution.

## MockBuilder

```ts
// No animations at all
MockBuilder(MyComponent, MyModule).exclude(BrowserAnimationsModule);

// Mock BrowserAnimationsModule
MockBuilder(MyComponent, MyModule).mock(BrowserAnimationsModule);

// Keep BrowserAnimationsModule to test animations.
MockBuilder(MyComponent, MyModule).keep(BrowserAnimationsModule);
```

## ngMocks.guts

```ts
// No animations at all
ngMocks.guts(MyComponent, MyModule, BrowserAnimationsModule);

// Mock BrowserAnimationsModule
ngMocks.guts(MyComponent, [MyModule, BrowserAnimationsModule]);

// Keep BrowserAnimationsModule to test animations.
ngMocks.guts([MyComponent, BrowserAnimationsModule], MyModule);
```

## fakeAsync

A kept / mock `BrowserAnimationsModule` causes issues with `fakeAsync`.
Please open an issue on github, if you have a case where `NoopAnimationsModule` isn't a solution.

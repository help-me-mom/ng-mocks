---
title: Internals vs. externals in mock modules
description: Information about difference between internals and externals when in mock modules using MockModule
sidebar_label: Internals vs. externals
---

There is an **important thing to know** when a module should be mocked.

Let's imagine, we have a module and its definition looks like:

```ts
@NgModule({
  imports: [ExternalModule],
  declarations: [
    MyComponent,
    InternalDirective,
  ],
  exports: [MyComponent],
})
class InternalModule {}
```

## Explanation

There are **two declarations** in the module: `MyComponent` and `InternalDirective`.
They can **use each other**, because they have been declared in the same module.

When we **check exports**, then we see, that only `MyComponent` has been exported.
It means, that if a module imports `InternalModule`, there is **no way to access** `InternalDirective`
directly.

This is fine, if we build an Angular application. `InternalDirective` is something **internal**,
and we **do not need to use it** in our application outside of `InternalModule`.
However, in tests we have a different story.

## Testing internals

Now, let's imagine we want to cover `InternalDirective` with tests,
and `ExternalModule` and `MyComponent` are its dependencies
which we would like to replace with mocks.

Because `InternalModule` has all dependencies,
at first glance, it makes sense to mock it:

```ts
TestBed.configureTestingModule({
  imports: [
    MockModule(InternalModule),
  ],
  declarations: [
    InternalDirective,
  ],
});
```

But, it **will not** do what we expected, because `InternalModule` exports only `MyComponent`,
and, therefore, there is no access to `ExternalModule` in the testing module.

We could add `MockModule(ExternalModule)` to `imports` in the testing module,
but the code is starting to smell, because `ExternalModule` has been already imported in the module
`InternalDirective` belongs to,
and an additional import of `MockModule(ExternalModule)` feels wrong.

Seems like, if [`MockModule`](/api/MockModule.md) exported its imports and declarations, it would solve the issue.

Yes... it was like that in versions before 9,
but then another issue appeared, and it belongs to externals (exports).

## Testing externals

Now, let's imagine we want to cover `MyComponent` with tests.
The story is the same,
`ExternalModule` and `InternalDirective` are its dependencies
which we would like to replace with mocks.

Because `InternalModule` has all dependencies,
at first glance, it makes sense to mock it:

```ts
TestBed.configureTestingModule({
  imports: [
    MockModule(InternalModule),
  ],
  declarations: [
    MyComponent,
  ],
});
```

Additionally, to the issue of `InternalDirective`, which has not been exported, there is another one.

Because `MockModule(InternalModule)` exports `MockComponent(MyComponent)`, there are two declarations of `MyComponent`
defined in the testing module now.
Eventually, it will lead us to the error about [declarations of 2 modules](declarations-of-2-modules.md).

It means, that in tests for `MyComponent` where we want to mock dependencies, we cannot use `InternalModule` at all.

## Solution

If you have read [quick start](/extra/quick-start.md), you know it.
It can be achieved by [`MockBuilder`](/api/MockBuilder.md) or [`ngMocks.guts`](/api/ngMocks/guts.md).

Both of them solve the issue, but in different ways.

### MockBuilder

[`MockBuilder(InternalDirective, InternalModule)`](/api/MockBuilder.md) builds a new definition for `InternalModule`,
where `InternalDirective` has been exported, so `InternalDirective` has access to all its dependencies as before,
and we have access to `InternalDirective` in the test:

```ts
@NgModule({
  imports: [
    MockModule(ExternalModule),
  ],
  declarations: [
    MockComponent(MyComponent),
    InternalDirective,
  ],
  exports: [
    MockComponent(MyComponent),
    InternalDirective,
  ],
})
class MockInternalModule {}

TestBed.configureTestingModule({
  imports: [
    MockInternalModule,
  ],
});
```

With [`MockBuilder`](/api/MockBuilder.md), we can change export behavior when we need it,
it can be achieved with [export](/api/MockBuilder.md#export-flag) and [exportAll](/api/MockBuilder.md#exportall-flag) flags.  

### ngMocks.guts

[`ngMocks.guts(InternalDirective, InternalModule)`](/api/ngMocks/guts.md) simply mocks guts of `InternalModule`,
so the definition of a testing module looks like: 

```ts
TestBed.configureTestingModule({
  imports: [
    MockModule(ExternalModule),
  ],
  declarations: [
    MockComponent(MyComponent),
    InternalDirective,
  ],
});
```

---
title: 'How to fix Template parse errors: <component> is not a known element'
description: 'A solution for Angular tests when they fail with "Template parse errors: <component> is not a known element"'
sidebar_label: 'Not a known element'
---

This error might happen in a test when we have a mock module of the module
a testing component depends on, but its declarations have not been exported.

```ts
@NgModule({
  declarations: [DependencyComponent],
})
class MyModule {}
```

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    declarations: [
      MyComponent, // <- the only declaration we care about.
    ],
    imports: [MockModule(MyModule)],
  });
  return TestBed.compileComponents();
});
```

In this case, a test will throw `Template parse errors: <DependencyComponent> is not a known element`.

The problem here is that `DependencyComponent` is not exported,
and to get access to a mock `DependencyComponent` we need either
to declare it on the same level where `MyComponent` has been declared
or to export `DependencyComponent`.

there are 3 solutions to do it:

1. to call [`MockComponent`](/api/MockComponent.md) on it directly in the `TestBed`

   ```ts
   beforeEach(() => {
     TestBed.configureTestingModule({
       declarations: [MyComponent, MockComponent(DependencyComponent)],
     });
     return TestBed.compileComponents();
   });
   ```

2. to use [`ngMocks.guts`](/api/ngMocks/guts.md),
   it does the same things as the first solution,
   but provides mocks of all imports and declarations from `MyModule`.

   ```ts
   beforeEach(() => {
     TestBed.configureTestingModule(ngMocks.guts(MyComponent, MyModule));
     return TestBed.compileComponents();
   });
   ```

3. to use [`MockBuilder`](/api/MockBuilder.md),
   its behavior differs from the solutions above. It creates a mock `MyModule`,
   that exports all its imports and declarations including a mock `DependencyComponent`.

   ```ts
   // Do not forget to return the promise of MockBuilder.
   beforeEach(() => MockBuilder(MyComponent, MyModule));
   ```

Profit. More detailed information about pros and cons of each approach you can read in
[motivation and quick start from ng-mocks](/extra/quick-start.md).

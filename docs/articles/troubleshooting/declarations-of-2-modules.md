---
title: 'How to fix Error: Type is part of the declarations of 2 modules'
description: A solution for Angular tests when they fail with "Type is part of the declarations of 2 modules"
sidebar_label: Declarations of 2 modules
---

If you encounter the issue, highly likely it means that a mock declaration,
usually a mock module, contains something, that is declared in the `TestBed` module directly.

Let's imagine a situation that we have a module which exports declarations, for example directives, we need in our test.
At the same time, we have another module that has other declarations, our component depends on,
we would like to turn into a mock object, but, at the same time, it imports the same module we want to keep as it is
via an import in `TestBed`.

```ts
TestBed.configureTestingModule({
  imports: [
    SharedModule,
    MockModule(ModuleWithServicesAndSharedModule),
  ],
  declarations: [
    ComponentToTest,
  ],
});
```

The problem is clear: when we create the mock module, [`MockModule`](/api/MockModule.md) recursively creates its mock dependencies, and, therefore, it creates a mock class of `SharedModule`.
Now imported and mock declarations are part of 2 modules.

To solve this, we need to let [`MockModule`](/api/MockModule.md) know, that `SharedModule` should stay as it is.

There are good and bad news.
The bad news is that [`MockModule`](/api/MockModule.md) does not support that,
but the good news is that `ng-mocks` has [`MockBuilder`](/api/MockBuilder.md) for such a complicated case.
The only task now is to rewrite `beforeEach` to use [`MockBuilder`](/api/MockBuilder.md) instead of [`MockModule`](/api/MockModule.md).

**A possible solution** might look like:

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, ModuleWithServicesAndSharedModule)
    .keep(SharedModule);
});
```

The configuration says that we want to test `ComponentToTest`, which depends on `SharedModule` and `ModuleWithServicesAndSharedModule`, but `SharedModule` should stay as it is.

Now, during the building process, [`MockBuilder`](/api/MockBuilder.md) will keep `SharedModule` as it is, although it is a dependency of the mock module, and that avoids declarations of the same things in 2 modules.

More detailed information how to use it you can find in the section called [`MockBuilder`](/api/MockBuilder.md).

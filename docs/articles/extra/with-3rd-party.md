---
title: Usage with 3rd-party libraries
description: Integration of ng-mocks with other libraries and frameworks
---

`ng-mocks` provides flexibility via [`ngMocks.guts`](../api/ngMocks/guts.md) and [`MockBuilder`](../api/MockBuilder.md)
that allows developers to use other **Angular testing libraries**,
and at the same time to **turn dependencies into mocks**.

## @ngneat/spectator

For example, if there is a need to mock declarations in `@ngneat/spectator` and its functions
like `createHostFactory`, `createComponentFactory`, `createDirectiveFactory` and so on, we need:

- exclude the component we want to test
- to turn declarations of its module into mocks
- export all declarations the module has

if we use [`ngMocks.guts`](../api/ngMocks/guts.md) we need to skip the first parameter, pass the module
as the second parameter to export its declaration, and to pass the component as the third one to exclude it.

```ts
const dependencies = ngMocks.guts(null, MyModule, MyComponent);
const createComponent = createComponentFactory({
  component: MyComponent,
  ...dependencies,
});
```

If we use [`MockBuilder`](../api/MockBuilder.md) we need [`.exclude`](../api/MockBuilder.md#exclude), [`.mock`](../api/MockBuilder.md#mock) and [`exportAll`](../api/MockBuilder.md#exportall-flag) flag.

```ts
const dependencies = MockBuilder()
  .exclude(MyComponent)
  .mock(MyModule, {
    exportAll: true,
  })
  .build();

const createComponent = createComponentFactory({
  component: MyComponent,
  ...dependencies,
});
```

Profit.

## @testing-library/angular

The same applies to `@testing-library/angular`.

In case of [`ngMocks.guts`](../api/ngMocks/guts.md):

```ts
const dependencies = ngMocks.guts(null, MyModule, MyComponent);
await render(MyComponent, dependencies);
```

In case of [`MockBuilder`](../api/MockBuilder.md):

```ts
const dependencies = MockBuilder()
  .exclude(MyComponent)
  .mock(MyModule, {
    exportAll: true,
  })
  .build();
await render(MyComponent, dependencies);
```

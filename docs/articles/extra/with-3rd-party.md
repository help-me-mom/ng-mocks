---
title: Usage with 3rd-party libraries
description: Integration of ng-mocks with other libraries and frameworks
---

`ng-mocks` provides flexibility via [`ngMocks.guts`](/api/ngMocks/guts.md) and [`MockBuilder`](/api/MockBuilder.md)
that allows developers to use other **Angular testing libraries**,
and at the same time to **turn dependencies into mocks**.

## `@ngneat/spectator`

For example, if there is a need to mock declarations
in [`@ngneat/spectator`](https://www.npmjs.com/package/@ngneat/spectator) and its functions
like `createHostFactory`, `createComponentFactory`, `createDirectiveFactory` and so on,
you can use two options from `ng-mocks`: [`ngMocks.guts`](/api/ngMocks/guts.md) and [`MockBuilder`](/api/MockBuilder.md)

### `@ngneat/spectator` and `ngMocks.guts`

if we use [`ngMocks.guts`](/api/ngMocks/guts.md) we need to pass the desired component to the first parameter,
and its module to pass as the second parameter to extract its guts and mock them.

```ts
const dependencies = ngMocks.guts(MyComponent, ItsModule);
const createComponent = createComponentFactory({
  component: MyComponent,
  ...dependencies,
});
```

### `@ngneat/spectator` and MockBuilder

If we use [`MockBuilder`](/api/MockBuilder.md), then we simply build what we need.
`MyComponent` is kept, whereas all declarations, imports and exports of `ItsModule` are mocked.

```ts
const dependencies = MockBuilder(MyComponent, ItsModule).build();

const createComponent = createComponentFactory({
  component: MyComponent,
  ...dependencies,
});
```

Please note, it also covers standalone components, directives and pipes.
All imports of `StandaloneComponent` will be mocked, whereas the component is available as it is for testing.

```ts
const dependencies = MockBuilder(StandaloneComponent).build();

const createComponent = createComponentFactory({
  component: StandaloneComponent,
  ...dependencies,
});
```

Profit.

## @testing-library/angular

The same applies to [`@testing-library/angular`](https://www.npmjs.com/package/@testing-library/angular).

### @testing-library/angular and ngMocks.guts

In case of [`ngMocks.guts`](/api/ngMocks/guts.md):

```ts
const dependencies = ngMocks.guts(MyComponent, ItsModule);
await render(MyComponent, dependencies);
```

### @testing-library/angular and MockBuilder

In case of [`MockBuilder`](/api/MockBuilder.md):

```ts
const dependencies = MockBuilder(MyComponent, ItsModule).build();
await render(MyComponent, dependencies);
```

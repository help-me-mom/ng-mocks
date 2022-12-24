---
title: How to customize mocks in Angular tests
description: Information how to customize behavior of mocks produced by ng-mocks in Angular tests
sidebar_label: Customize mocks
---

`ng-mocks` providers vast ways how to mock declarations, providers and classic classes.
The goal of this article is to explain purpose of every way and to try to describe it in details.

## ngMocks.defaultMock

[`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md) - is useful to provide **default mock behavior** for declarations, services and tokens in the **entire test suites**.
For example, we have a service with a property that is an observable stream.
In tests, we would like to avoid failures like `Cannot read property 'subscribe' of undefined`,
when we are mocking the service.

It can be done like that:

```ts title="src/test.ts"
ngMocks.defaultMock(MyService, () => ({
  stream$: EMPTY,
}));
```

Profit, now mocks of `MyService` will have an `EMPTY` stream in the `stream$` property and all its subscribes will not fail anymore.
More information you can find in the related section about [`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md).

## MockProvider

[`MockProvider`](/api/MockProvider.md) - is useful when we are configuring `TestBed.configureTestingModule`
and would like to mock a service or a token.

```ts
TestBed.configureTestingModule({
  providers: [MockProvider(MyService)],
});
```

Now, in related tests, `MyService` will be replaced with its mock object where its `stream$` property is the `EMPTY` observable stream due to the
customization in the previous section about [`ngMocks.defaultMock`](#ngmocksdefaultmock).

Furthermore, we can pass a custom slice as the second parameter for extra customization.
It takes the effect after all customizations defined in [`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md).

```ts
TestBed.configureTestingModule({
  providers: [
    MockProvider(MyService, {
      stream$: throwError(new Error('broken stream')),
    }),
  ],
});
```

This will override the `stream$` property, and now, all its subscribes will get an error in the related tests.
More information you can find in the section about [`MockProvider`](/api/MockProvider.md).

## MockInstance

[`MockInstance`](/api/MockInstance.md) - is useful when we need to customize behavior of a declaration or provider in a particular test.
For example, we want the `stream$` to emit something.

:::note
[`MockProvider`](/api/MockProvider.md) should be called before [`MockRender`](/api/MockRender.md) or `TestBed.createComponent`.
:::

```ts
it('test', () => {
  const stream$ = new Subject();
  MockInstance(MyService, () => ({
    stream$,
  }));
  const fixture = MockRender(MyComponent);

  stream$.next(true); // a mock emit.
  fixture.detectChanges();
});
```

[`MockInstance`](/api/MockInstance.md) is the latest in the sequence of customizing behavior,
and will be applied after [`MockProvider`](/api/MockProvider.md), [`MockBuilder.mock`](/api/MockBuilder.md#mock)
and [`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md).

More information you can find in the related section about [`MockInstance`](/api/MockInstance.md).

## MockService

[`MockService`](/api/MockService.md) - is useful when we need to create a mock instance of a class, and the class
do not belong to declarations or providers.

**A mock object** produced by [`MockService`](/api/MockService.md) is based on its original class, and provides:

- all methods are dummies
- all properties have been linked via getters and setters <small>(might not work in some cases, use [`ngMocks.stub`](/api/ngMocks/stub.md) then)</small>
- respects [auto spy](auto-spy.md) environment

For example, we have a mock component which real copy has an `inputElement` property with an instance of [`HTMLInputElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement),
and some other component tries to `focus` on it like `this.viewChildRef.inputElement.focus()`, and another one tries to `blur`, etc.
But, in our tests, these calls are just **side effects**, we would like to suppress them.

That is the case where [`MockService`](/api/MockService.md) shines. Because this customization may be useful for other tests too, let's define it via [`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md).
Also, its optional second parameter accepts a slice of the instance for extra customization.

```ts title="src/test.ts"
ngMocks.defaultMock(MyComponent, () => ({
  inputElement: MockService(HTMLInputElement, {
    tagName: 'DIV',
  }),
}));
```

Profit. Now, every time when a mock object of `MyComponent` is needed, its `inputElement` will be a mock object of `HTMLInputElement`,
and its consumers can safely call `.focus()`, `.blur()` along with other methods.

## Recap

To recap the section:

- [`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md) - customize mocks of declarations and providers **globally**.
- [`MockProvider`](/api/MockProvider.md) - customizes mocks of declarations and providers **in suites**.
- [`MockInstance`](/api/MockInstance.md) - customizes mocks of declarations and providers **in tests**.
- [`MockService`](/api/MockService.md) - creates **mock objects out of any classes**.

The priority of customization is:

- The first calls go to [`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md)
- The second calls go to [`MockProvider`](/api/MockProvider.md) and [`MockBuilder.mock`](/api/MockBuilder.md#mock)
- The last call goes to [`MockInstance`](/api/MockInstance.md)

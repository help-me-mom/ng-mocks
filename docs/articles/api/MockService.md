---
title: How to get a mock instance of any class in Angular tests
description: Information on how to mock classes and objects in Angular tests with ng-mocks
sidebar_label: MockService (classes)
---

:::warning
If you are here in order to mock **a service** or **a token**,
please read [corresponding section about MockProvider](MockProvider.md).

If you want to change default mock behavior,
please read [how to customize mocks](/extra/customize-mocks.md).
:::

If you **need a mock object of a class** which does not belong to Angular declarations, for instance `HTMLInputElement`,
then, please, **continue reading**.

**A mock instance of a class** in Angular tests can be created by `MockService` function.
The mock instance has the same methods as the original class, but all of them are dummies.
Additionally, `MockService` accepts a shape of the desired instance, in order to customize its properties and methods.

```ts
const i1 = MockService(MyClass);
// i1.method() returns undefined

const i2 = MockService(MyClass, {
  method: () => 'My Custom Behavior',
});
// i2.method() returns 'My Custom Behavior'
```

It is useful, when a class has dozens of methods, whereas we want to change behavior of a few of them.

## Own properties

`MockService` also preserves own object properties of classes which can be created without constructor arguments.
This is useful for services that expose an object with methods as a public field.

```ts
class TargetService {
  public readonly info = {
    request: () => 'real',
  };
}

ngMocks.autoSpy('jasmine');

const service = MockService(TargetService);

service.info.request();

expect(service.info.request).toHaveBeenCalledTimes(1);
```

In this case, `info` stays available on the mock instance, and `info.request` becomes a mock method.
If the constructor needs arguments, or if calling it without arguments throws, `MockService` falls back to mocking the prototype.

## Simple example

Let's suppose that a service has a method which returns `HTMLInputElement`, but we would like to mock the service
along with its `HTMLInputElement`, because `TargetComponent` calls its `focus()` in `ngOnInit` like
`this.htmlService.input.focus()`.

```ts
TestBed.configureTestingModule({
  declarations: [TargetComponent],
  providers: [
    // profit
    MockProvider(HtmlService, {
      input: MockService(HTMLInputElement),
    }),
  ],
});
```

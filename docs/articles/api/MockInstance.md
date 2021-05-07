---
title: MockInstance - flexibility of mocks in Angular tests
description: Information how to customize mock components, directives, services and tokens in Angular tests with help of ng-mocks
sidebar_label: MockInstance
---

**MockInstance** helps to define **customizations for declarations** and providers in test suites
before the desired instance have been created.

It is useful, when we want to configure spies before their usage.
It supports: modules, components, directives, pipes, services and tokens.

There are **three ways how to customize** a mock instance:

- set desired values
- manipulate the instance (with access to injector)
- return the desired shape (with access to injector)

## Set desired values

It helps to provide a predefined spy or value.

```ts
MockInstance(Service, 'methodName', () => 'fake');
MockInstance(Service, 'propName', 'fake');
MockInstance(Service, 'propName', () => 'fake', 'get');
MockInstance(Service, 'propName', () => undefined, 'set');
```

It returns the provided value, that allows to customize spies.

```ts
MockInstance(Service, 'methodName', jasmine.createSpy())
  .and.returnValue('fake');
MockInstance(Service, 'propName', jest.fn(), 'get')
  .mockReturnValue('fake');
```

## Manipulate the instance

If we pass a callback as the second parameter to **MockInstance**,
then we have access to the instance and to the related injector.

```ts
MockInstance(Service, (instance, injector) => {
  instance.prop1 = injector.get(SOME_TOKEN);
  instance.method1 = jasmine.createSpy().and.returnValue(5);
  instance.method2 = value => (instance.prop2 = value);
});
```

## Return the desired shape

If the callback of the second parameter of **MockInstance** returns something,
then the returned value will be applied to the instance.

```ts
// with injector and spies
MockInstance(Service, (instance, injector) => ({
  prop1: injector.get(SOME_TOKEN),
  method1: jasmine.createSpy().and.returnValue(5),
  method2: value => (instance.prop2 = value),
}));

// a simple shape
MockInstance(Service, () => ({
  prop1: 1,
  method1: jasmine.createSpy(),
  method2: jasmine.createSpy(),
}));
```

## Customizing tokens

In case of tokens, a callback should return the token value.

```ts
MockInstance(TOKEN, (instance, injector) => {
  return injector.get(SOME_OTHER_TOKEN);
});
MockInstance(TOKEN, () => true);
```

## Resetting customization

In order to reset the provided callback, `MockInstance` should be called without it.

```ts
MockInstance(Service);
MockInstance(TOKEN);
// Or simply one call.
// It resets all customizations for all declarations.
MockReset();
```

## Overriding customization

Every call of `MockInstance` overrides the previous callback.
`MockInstance` can be called anywhere,
but **suggested usage** is to call `MockInstance` in `beforeEach` or in `it`,
then the callback has its effect only during the current spec.

```ts
beforeAll(() => MockInstance(TOKEN, () => true));
// If we do not call MockReset,
// then TOKEN will be true in other suites too.
// To avoid this side effect, beforeEach should be used.
afterAll(MockReset);

it('test 1', () => {
  // token is true
  expect(TestBed.get(TOKEN)).toEqual(true);
});

it('test 2', () => {
  // token is false
  MockInstance(TOKEN, () => false);
  expect(TestBed.get(TOKEN)).toEqual(false);
});

it('test 3', () => {
  // token is true again
  expect(TestBed.get(TOKEN)).toEqual(true);
});
```

## When to use

It is definitely the right time to use it, if a test fails like:

- [TypeError: Cannot read property 'subscribe' of undefined](../troubleshooting/read-property-of-undefined.md)
- [TypeError: Cannot read property 'pipe' of undefined](../troubleshooting/read-property-of-undefined.md)
- or any other issue like reading properties or calling methods of undefined

Or we want to customize a mock declaration which is accessed via:

- `@ViewChild`
- `@ViewChildren`
- `@ContentChild`
- `@ContentChildren`

Let's pretend a situation when our component uses `ViewChild` to access a child component instance.

```ts
class RealComponent implements AfterViewInit {
  @ViewChild(ChildComponent) public readonly child: ChildComponent;

  ngAfterViewInit() {
    this.child.update$.subscribe();
  }
}
```

When we test `RealComponent` we would like to have a mock `ChildComponent`,
and it would mean, if we replaced it with a mock `ChildComponent` then its `update$` would return `undefined`,
therefore our test would fail in `ngAfterViewInit` because of [`TypeError: Cannot read property 'subscribe' of undefined`](../troubleshooting/read-property-of-undefined.md).

In our case, we have a component instance created by Angular, and does not look like `TestBed` provides
a solution here. That is where `ng-mocks` helps again with the `MockInstance` helper function.
It accepts a class as the first parameter, and a tiny callback describing how to customize its instances as the second one.

```ts
// Now we can customize a mock object.
// The update$ property of the object
// will be set to EMPTY in its ctor call.
beforeEach(() => MockInstance(ChildComponent, 'update$', EMPTY));
```

Profit. When Angular creates an instance of `ChildComponent`, the rule is applied in its constructor, and `update$` property
of the instance is not `undefined`, but an `Observable`.

## Advanced example

An advanced example of **customizing a mock component before its initialization** in Angular tests.
Please, pay attention to comments in the code.

- [Try it on StackBlitz](https://stackblitz.com/github/ng-mocks/examples?file=src/examples/MockInstance/test.spec.ts&initialpath=%3Fspec%3DMockInstance)
- [Try it on CodeSandbox](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockInstance/test.spec.ts&initialpath=%3Fspec%3DMockInstance)

```ts
describe('MockInstance', () => {
  // A normal setup of the TestBed, TargetComponent will be replaced
  // with its mock object.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(RealComponent).mock(ChildComponent));

  beforeEach(() => {
    // Because TargetComponent is replaced with its mock object,
    // its update$ is undefined and ngAfterViewInit of the parent
    // component will fail on .subscribe().
    // Let's fix it via defining customization for the mock object.
    MockInstance(ChildComponent, () => ({
      // comment the next line to check the failure.
      update$: EMPTY,
    }));
  });

  it('should render', () => {
    // Without the custom initialization rendering would fail here
    // with "Cannot read property 'subscribe' of undefined".
    expect(() => MockRender(RealComponent)).not.toThrow();
  });
});
```

---
title: MockInstance - flexibility of mocks in Angular tests
description: Information how to customize mock components, directives, services and tokens in Angular tests with help of ng-mocks
sidebar_label: MockInstance
---

**MockInstance** helps to define **customizations for mock declarations** and mock providers in test suites
before the desired instance have been created.

It is useful, when we want to configure spies before their usage.
It supports: modules, components, directives, pipes, services and tokens.

The mocks should be created by:
- [`MockBuilder`](/api/MockBuilder.md)
- [`MockModule`](/api/MockModule.md)
- [`MockComponent`](/api/MockComponent.md)
- [`MockDirective`](/api/MockDirective.md)
- [`MockProvider`](/api/MockProvider.md)

## Define customizations

There are **three ways how to customize** a mock instance:

- set desired values
- manipulate the instance (with access to injector)
- return the desired shape (with access to injector)

### Set desired values

It helps to provide a predefined value or fake implementation.

```ts
// Setting custom implementation of Service.methodName().
MockInstance(Service, 'methodName', () => 'fake');

// Setting custom value of Component.propName.
MockInstance(Component, 'propName', 'fake');

// Setting the getter of Directive.propName.
MockInstance(Directive, 'propName', () => 'fake', 'get');

// Setting the setter of Pipe.propName.
MockInstance(Pipe, 'propName', () => undefined, 'set');
```

Also, `MockInstance` returns the provided value, that allows to customize spies.

```ts
MockInstance(Service, 'methodName', jasmine.createSpy())
  .and.returnValue('fake');
MockInstance(Service, 'propName', jest.fn(), 'get')
  .mockReturnValue('fake');
```

### Manipulate the instance

If we pass a callback as the second parameter to **MockInstance**,
then we have access to the instance and to the related injector.

```ts
MockInstance(Service, (instance, injector) => {
  instance.prop1 = injector.get(SOME_TOKEN);
  instance.method1 = jasmine.createSpy().and.returnValue(5);
  instance.method2 = value => (instance.prop2 = value);
});
```

### Return the desired shape

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

### Customizing tokens

In case of tokens, a callback should return the token value.

```ts
MockInstance(TOKEN, (instance, injector) => {
  return injector.get(SOME_OTHER_TOKEN);
});
MockInstance(TOKEN, () => true);
```

## Customization scopes

Time to time, we need to apply a set of customizations for a suite or a test.
To discard each customization might require writing boring resets, especially, when we have a lot of them.
In such a case, [`MockInstance.remember()`](#remember) and [`MockInstance.restore()`](#restore) come for help. 

### Remember

`MockInstance.remember()` creates a check point. Any mock customizations via `MockInstance` after the checkpoint will be recorded separately.

### Restore

`MockInstance.restore()` discards mock customizations starting from the last known checkpoint.
The operation can be repeated unless there is a checkpoint.

### Example

For example, we can create checkpoints in `beforeAll` or `beforeEach`,
and discard their mock customizations in `afterAll` or `afterEach`.

```ts
describe('suite', () => {
  beforeAll(MockInstance.remember);
  afterAll(MockInstance.restore);

  // Exists only during this and all child suites.
  beforeAll(() => MockInstance(SomeService, 'login$', EMPTY));
  beforeAll(() => MockInstance(SomeService, 'logout$', EMPTY));

  describe('sub suite', () => {
    beforeEach(MockInstance.remember);
    afterEach(MockInstance.restore);

    // Existins only during this sub suite.
    // After the sub suite, the parent
    // customization will be present.
    beforeEach(() => MockInstance(SomeService, 'login$', throwError('wrong')));
    beforeEach(() => MockInstance(SomeService, 'logout$', throwError('wrong')));
  });
});
```

### Scope

There is `MockInstance.scope()` to reduce the code to one line:

```ts
describe('suite', () => {
  // Uses beforeAll and afterAll.
  MockInstance.scope('suite');

  describe('sub suite #1', () => {
    // Uses beforeEach and afterEach.
    MockInstance.scope();
    // the same
    // MockInstance.scope('case');
  });
  
  describe('sub suite #2', () => {
    // Uses beforeAll, afterAll, 
    // beforeEach and afterEach.
    MockInstance.scope('all');
    // the same
    // MockInstance.scope('suite');
    // MockInstance.scope('case');
  });
});
```

## Hard reset customization

In order to reset the provided callback, `MockInstance` should be called without it.
Usually, it's used in `afterEach` or `afterAll`, but better to use [scopes](#scope).

```ts
afterEach(() => MockInstance(Service)); // resets customizations of Service
afterEach(() => MockInstance(TOKEN)); // resets customizations of TOKEN

// Or simply one call.
// It resets all customizations for all declarations.
afterEach(() => MockReset());
```

## Overriding customization

Every call of `MockInstance` overrides the previous callback.
`MockInstance` can be called anywhere,
whereas the **suggested usage** is to use [`MockInstance.scope`](#scope)
and to call `MockInstance` in `beforeEach` or in `it`,
then the callback has its effect only during the current spec.

```ts
// Defining the scope for this suite.
MockInstance.scope();

// Defining default customization for a token.
beforeAll(() => MockInstance(TOKEN, () => true));

// ItsModule provides TOKEN which is used in TargetComponent.
beforEach(() => MockBuilder(TargetComponent, ItsModule));

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

- [TypeError: Cannot read property 'subscribe' of undefined](/troubleshooting/read-property-of-undefined.md)
- [TypeError: Cannot read property 'pipe' of undefined](/troubleshooting/read-property-of-undefined.md)
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
therefore our test would fail in `ngAfterViewInit` because of [`TypeError: Cannot read property 'subscribe' of undefined`](/troubleshooting/read-property-of-undefined.md).

In our case, we have a component instance created by Angular, and does not look like `TestBed` provides
a solution here. That is where `ng-mocks` helps again with the `MockInstance` helper function.
It accepts a class as the first parameter, and a tiny callback describing how to customize its instances as the second one.

```ts
// Now we can customize a mock object.
// The update$ property of the object
// will be set to EMPTY in its ctor call.
MockInstance.scope();
beforeEach(() => MockInstance(ChildComponent, 'update$', EMPTY));
```

Profit. When Angular creates an instance of `ChildComponent`, the rule is applied in its constructor, and `update$` property
of the instance is not `undefined`, but an `Observable`.

## An example with MockBuilder

An advanced example of **customizing a mock component before its initialization** in Angular tests.
Please, pay attention to comments in the code.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockInstance/test.spec.ts&initialpath=%3Fspec%3DMockInstance)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockInstance/test.spec.ts&initialpath=%3Fspec%3DMockInstance)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockInstance/test.spec.ts"
describe('MockInstance', () => {
  // Creates a scope to reset customizations automatically after this test.
  MockInstance.scope();

  // A normal setup of the TestBed, ChildComponent will be replaced
  // with its mock object.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(RealComponent, ItsModule));

  beforeEach(() => {
    // Because ChildComponent is replaced with its mock object,
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

## An example with TestBed and MockComponent

An advanced example of **customizing a mock component before its initialization** in Angular tests.
Please, pay attention to comments in the code.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockInstance/component.spec.ts&initialpath=%3Fspec%3DMockInstance%3Acomponent)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockInstance/component.spec.ts&initialpath=%3Fspec%3DMockInstance%3Acomponent)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockInstance/component.spec.ts"
describe('MockInstance:component', () => {
  // Creates a scope to reset customizations automatically after this test.
  MockInstance.scope();

  // Configuring TestBed with a mock for ChildComponent.
  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [
        RealComponent,
        MockComponent(ChildComponent),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    // Because ChildComponent is replaced with its mock object,
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
    expect(() => TestBed.createComponent(RealComponent).detectChanges()).not.toThrow();
  });
});
```

---
title: How to mock modules in Angular tests
description: Information how to mock modules with their imports, declarations and providers in Angular tests with help of ng-mocks
sidebar_label: MockModule
---

**A mock module in Angular tests** can be created by `MockModule` function.
The mock module has the identical interface as its source module,
but all its methods are dummies, and `imports`, `declarations`, `providers` and `exports` have been mocked respectively.

To turn a module into a mock module, simply pass its class into `MockModule` function.

```ts
TestBed.configureTestingModule({
  imports: [MockModule(Module), MockModule(Module.forRoots())],
});
```

A mock module provides:

- mocks of all components, directives, pipes and providers
- mocks of all imports and exports
- dummy clones of all services
- dummy abstract methods for services with a `useClass` definition
- mocks of tokens with a `useClass` definition
- respect of tokens with a `useExisting` definition
- empty objects instead of tokens with a `helperUseFactory` definition
- base primitives instead of tokens with a `useValue` definition
- mocks of tokens with a `useValue` definition can read in the section called [How to fix `Type is part of the declarations of 2 modules`](/troubleshooting/declarations-of-2-modules.md).

:::danger
Do not use `MockModule` on modules which declare the tested declaration. 
Use **[MockBuilder](MockBuilder.md)** or **[ngMocks.guts](ngMocks/guts.md)** in such cases.
:::

## Simple example

Let's imagine an Angular application, where `TargetComponent` depends on declarations from `DependencyModule` module,
and we would like to use their mocks in a test.

Usually `beforeEach` looks like:

```ts
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // our component for testing
      declarations: [TargetComponent],

      // annoying dependency
      imports: [DependencyModule],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

In order to create **a mock module**, simply pass its class into `MockModule`:

```ts
TestBed.configureTestingModule({
  declarations: [TargetComponent],

  // profit
  imports: [MockModule(DependencyModule)],
});
```

Or be like a pro and use [`MockBuilder`](MockBuilder.md), its [`.mock`](MockBuilder.md#mock) method
and [`MockRender`](MockRender.md):

```ts
describe('Test', () => {
  beforeEach(() => {
    return MockBuilder(TargetComponent).mock(DependencyModule);
  });

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

There is a trick to avoid specifying all dependencies of the `TargetComponent` in the chain:
simply pass its module as the second parameter of [`MockBuilder`](MockBuilder.md).
Everything in `TargetModule` will be replaced with their mocks, but not `TargetComponent`, it will stay as it is:

```ts
// Do not forget to return the promise of MockBuilder.
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

## Advanced example

An advanced example about **usage of mock modules** in Angular tests.
Please, pay attention to comments in the code.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockModule/test.spec.ts&initialpath=%3Fspec%3DMockModule)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockModule/test.spec.ts&initialpath=%3Fspec%3DMockModule)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockModule/test.spec.ts"
describe('MockModule', () => {
  beforeEach(() => {
    // DependencyModule is an import of ItsModule.
    return MockBuilder(MyComponent, ItsModule);
  });

  it('renders MyComponent with its dependencies', () => {
    const fixture = MockRender(MyComponent);
    const component = fixture.point.componentInstance;

    expect(component).toBeTruthy();
  });
});
```

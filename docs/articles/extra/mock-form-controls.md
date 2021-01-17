---
title: How to mock form controls in Angular tests
description: Information how to use ng-mocks in order to interact with mock form controls in Angular tests
sidebar_label: Mock form controls
---

`ng-mocks` respects `ControlValueAccessor` interface if [a directive](../api/MockDirective.md),
or [a component](../api/MockComponent.md) implements it.
Apart from that, `ng-mocks` provides helper functions to emit changes and touches.

it supports both `FormsModule` and `ReactiveFormsModule`:

- `ngModel`
- `ngModelChange`
- `formControl`
- `formControlName`

* `NG_VALUE_ACCESSOR`
* `ControlValueAccessor`
* `writeValue`
* `registerOnChange`
* `registerOnTouched`

- `NG_VALIDATORS`
- `Validator`
- `NG_ASYNC_VALIDATORS`
- `AsyncValidator`
- `registerOnValidatorChange`
- `validate`

## MockControlValueAccessor

A mock object of `ControlValueAccessor` additionally implements `MockControlValueAccessor` and provides:

- `__simulateChange(value: any)` - calls `onChanged` on the mock component bound to a `FormControl`
- `__simulateTouch()` - calls `onTouched` on the mock component bound to a `FormControl`

* [`isMockControlValueAccessor( instance )`](../api/helpers/isMockControlValueAccessor.md) - to verify `MockControlValueAccessor`

## MockValidator

A mock object of `Validator` or `AsyncValidator` additionally implements `MockValidator` and provides:

- `__simulateValidatorChange()` - calls `updateValueAndValidity` on the mock component bound to a `FormControl`

* [`isMockValidator( instance )`](../api/helpers/isMockValidator.md) - to verify `MockValidator`

## Advanced example

An advanced example of **a mock FormControl with ReactiveForms** in Angular tests.
Please, pay attention to comments in the code.

- [Try it on StackBlitz](https://stackblitz.com/github/ng-mocks/examples?file=src/examples/MockReactiveForms/test.spec.ts&initialpath=%3Fspec%3DMockReactiveForms)
- [Try it on CodeSandbox](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockReactiveForms/test.spec.ts&initialpath=%3Fspec%3DMockReactiveForms)

```ts
describe('MockReactiveForms', () => {
  // That is our spy on writeValue calls.
  // With auto spy this code is not needed.
  const writeValue = jasmine.createSpy('writeValue');
  // in case of jest
  // const writeValue = jest.fn();

  // Because of early calls of writeValue, we need to install
  // the spy in the ctor call.
  beforeEach(() =>
    MockInstance(DependencyComponent, () => ({
      writeValue,
    })),
  );

  beforeEach(() => {
    return MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(ReactiveFormsModule);
  });

  it('sends the correct value to the mock form component', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mock form component.
    const mockControl = ngMocks.find(DependencyComponent)
      .componentInstance;

    // During initialization it should be called
    // with null.
    expect(writeValue).toHaveBeenCalledWith(null);

    // Let's simulate its change, like a user does it.
    if (isMockControlValueAccessor(mockControl)) {
      mockControl.__simulateChange('foo');
    }
    expect(component.formControl.value).toBe('foo');

    // Let's check that change on existing formControl
    // causes calls of `writeValue` on the mock component.
    component.formControl.setValue('bar');
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});
```

A usage example of mock FormControl with ngModel in Angular tests

- [Try it on StackBlitz](https://stackblitz.com/github/ng-mocks/examples?file=src/examples/MockForms/test.spec.ts&initialpath=%3Fspec%3DMockForms)
- [Try it on CodeSandbox](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockForms/test.spec.ts&initialpath=%3Fspec%3DMockForms)

```ts
describe('MockForms', () => {
  // That is our spy on writeValue calls.
  // With auto spy this code is not needed.
  const writeValue = jasmine.createSpy('writeValue');
  // in case of jest
  // const writeValue = jest.fn();

  // Because of early calls of writeValue, we need to install
  // the spy in the ctor call.
  beforeEach(() =>
    MockInstance(DependencyComponent, () => ({
      writeValue,
    })),
  );

  beforeEach(() => {
    return MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(FormsModule);
  });

  it('sends the correct value to the mock form component', async () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mock form component.
    const mockControl = ngMocks.find(DependencyComponent)
      .componentInstance;

    // During initialization it should be called
    // with null.
    expect(writeValue).toHaveBeenCalledWith(null);

    // Let's simulate its change, like a user does it.
    if (isMockControlValueAccessor(mockControl)) {
      mockControl.__simulateChange('foo');
      fixture.detectChanges();
      await fixture.whenStable();
    }
    expect(component.value).toBe('foo');

    // Let's check that change on existing value
    // causes calls of `writeValue` on the mock component.
    component.value = 'bar';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});
```

---
title: How to mock form controls in Angular tests
description: Information how to use ng-mocks in order to interact with mock form controls in Angular tests
sidebar_label: Mock form controls
---

`ng-mocks` respects `ControlValueAccessor` interface if [a directive](/api/MockDirective.md),
or [a component](/api/MockComponent.md) implements it.
Apart from that, `ng-mocks` provides helper functions to emit [changes](/api/ngMocks/change.md) and [touches](/api/ngMocks/touch.md).

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

## Related tools

- [`ngMocks.change()`](/api/ngMocks/change.md)
- [`ngMocks.touch()`](/api/ngMocks/touch.md)

* [`isMockControlValueAccessor()`](/api/helpers/isMockControlValueAccessor.md)
* [`isMockValidator()`](/api/helpers/isMockValidator.md)

## Caution

:::warning Use methods instead of properties
It is important to implement ControlValueAccessor via methods
:::

Otherwise, there is no way to detect such properties via javascript interfaces,
because the properties don't exist without a constructor call, whereas mocks don't call original constructors.

Usually, if you are using properties in a test, you would get `No value accessor for form control with name ...`. 

```ts title="Wrong definition via properties"
export class MyControl implements ControlValueAccessor {
	public writeValue = () => {
	  // some magic
  };
	public registerOnChange = () => {
    // some magic
  };
	public registerOnTouched = () => {
    // some magic
  };
}
```

```ts title="Correct definition via methods"
export class MyControl implements ControlValueAccessor {
  public writeValue() {
    // some magic
  }

  public registerOnChange() {
    // some magic
  }

  public registerOnTouched() {
    // some magic
  }
}
```

## Advanced example

An advanced example of **a mock FormControl with ReactiveForms** in Angular tests.
Please, pay attention to comments in the code.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockReactiveForms/test.spec.ts&initialpath=%3Fspec%3DMockReactiveForms)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockReactiveForms/test.spec.ts&initialpath=%3Fspec%3DMockReactiveForms)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockReactiveForms/test.spec.ts"
describe('MockReactiveForms', () => {
  // Helps to reset MockInstance customizations after each test.
  MockInstance.scope();

  beforeEach(() => {
    // DependencyComponent is a declaration in ItsModule. 
    return MockBuilder(MyComponent, ItsModule)
      // ReactiveFormsModule is an import in ItsModule.
      .keep(ReactiveFormsModule);
  });

  it('sends the correct value to the mock form component', () => {
    // That is our spy on writeValue calls.
    // With auto spy this code is not needed.
    const writeValue = jasmine.createSpy('writeValue'); // or jest.fn();
    // in case of jest
    // const writeValue = jest.fn();

    // Because of early calls of writeValue, we need to install
    // the spy via MockInstance before the render.
    MockInstance(DependencyComponent, 'writeValue', writeValue);

    const fixture = MockRender(MyComponent);
    const component = fixture.point.componentInstance;

    // During initialization it should be called
    // with null.
    expect(writeValue).toHaveBeenCalledWith(null);

    // Let's find the form control element
    // and simulate its change, like a user does it.
    const mockControlEl = ngMocks.find(DependencyComponent);
    ngMocks.change(mockControlEl, 'foo');
    expect(component.formControl.value).toBe('foo');

    // Let's check that change on existing formControl
    // causes calls of `writeValue` on the mock component.
    component.formControl.setValue('bar');
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});
```

A usage example of mock FormControl with ngModel in Angular tests

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockForms/test.spec.ts&initialpath=%3Fspec%3DMockForms)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockForms/test.spec.ts&initialpath=%3Fspec%3DMockForms)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockForms/test.spec.ts"
describe('MockForms', () => {
  // Helps to reset customizations after each test.
  MockInstance.scope();

  beforeEach(() => {
    // DependencyComponent is a declaration in ItsModule.
    return MockBuilder(MyComponent, ItsModule)
      // FormsModule is an import in ItsModule.
      .keep(FormsModule);
  });

  it('sends the correct value to the mock form component', async () => {
    // That is our spy on writeValue calls.
    // With auto spy this code is not needed.
    const writeValue = jasmine.createSpy('writeValue'); // or jest.fn();
    // in case of jest
    // const writeValue = jest.fn();

    // Because of early calls of writeValue, we need to install
    // the spy via MockInstance before the render.
    MockInstance(DependencyComponent, 'writeValue', writeValue);

    const fixture = MockRender(MyComponent);
    // FormsModule needs fixture.whenStable()
    // right after MockRender to install all hooks.
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // During initialization, it should be called
    // with null.
    expect(writeValue).toHaveBeenCalledWith(null);

    // Let's find the form control element
    // and simulate its change, like a user does it.
    const mockControlEl = ngMocks.find(DependencyComponent);
    ngMocks.change(mockControlEl, 'foo');
    expect(component.value).toBe('foo');

    // Let's check that change on existing value
    // causes calls of `writeValue` on the mock component.
    component.value = 'bar';
    // Both below are needed to trigger writeValue.
    fixture.detectChanges();
    await fixture.whenStable();
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});
```

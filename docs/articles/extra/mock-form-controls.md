---
title: How to mock ControlValueAccessor in Angular tests
description: Mock a ControlValueAccessor child while testing parent values, touches, disabled state, and values written through Angular forms
sidebar_label: ControlValueAccessor
---

Use this guide when a component contains a custom `ControlValueAccessor` (CVA) child
whose implementation you want to mock. Keep Angular's form binding real and test how
the parent exchanges values with the mock.

For native inputs, start with the [ngModel guide](/guides/ng-model.md) or
[reactive forms guide](/guides/reactive-forms.md).

This parent connects its `formControl` to the `<cva>` child through
`[formControl]`. The child declaration below is reduced to its CVA contract because
the test replaces its implementation with a mock.

```ts
import { Component, forwardRef, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'target',
  standalone: false,
  template: '<cva [formControl]="formControl"></cva>',
})
class TargetComponent {
  public readonly formControl = new FormControl();
}

@Component({
  selector: 'cva',
  standalone: false,
  template: 'dependency',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
  ],
})
class CvaComponent implements ControlValueAccessor {
  public writeValue(): void {}
  public registerOnChange(): void {}
  public registerOnTouched(): void {}
  public setDisabledState(): void {}
}

@NgModule({
  declarations: [TargetComponent, CvaComponent],
  imports: [ReactiveFormsModule],
})
class ItsModule {}
```

## Test setup

Configure the testing module in `beforeEach` with [`MockBuilder`](/api/MockBuilder.md).
Keep `TargetComponent` and `ReactiveFormsModule` real so Angular connects the parent
to the child. The child component declared in `ItsModule` is replaced with a mock:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent, ItsModule).keep(ReactiveFormsModule),
);
```

## Testing the parent binding

:::warning Controls that update on blur or submit

With `updateOn: 'blur'`, call [`ngMocks.touch`](/api/ngMocks/touch.md) after `ngMocks.change`
to commit the pending value. Changing a mocked CVA does not invoke its registered touch callback.
With `updateOn: 'submit'`, submit the containing Angular form before asserting the new value;
see [testing ngSubmit](/extra/mock-ng-submit.md).

The example below uses the default update policy, which applies edits immediately.

:::

Inside `it`, render the parent with [`MockRender`](/api/MockRender.md), then use
[`ngMocks.find`](/api/ngMocks/find.md) with the original child component class.
Pass its host to [`ngMocks.change`](/api/ngMocks/change.md) to simulate the child's
registered change callback.

Read the parent's `FormControl.value` for the current form value. A CVA defines callbacks
for exchanging values; it does not define a stored-value property on the child or its host:

```ts
// Render the parent.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the child.
const mockControlEl = ngMocks.find(CvaComponent);

// Read the value.
expect(component.formControl.value).toBeNull();

// Change the value.
ngMocks.change(mockControlEl, 'foo');

// Assert the result.
expect(component.formControl.value).toBe('foo');
```

## A child bound with ngModel {#caution-about-ngmodel}

The same approach works with `ngModel`. In the parent, bind the child to a `value`
property:

```html
<cva [(ngModel)]="value"></cva>
```

```ts
public value: string | null = null;
```

For this version, `ItsModule` imports `FormsModule` from `@angular/forms`, and the test
keeps `FormsModule`:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent, ItsModule).keep(FormsModule),
);
```

Inside an async `it`, await `fixture.whenStable()` after rendering so `ngModel` can
register the control and apply its initial value. The same blur and submit policies
described above apply when configured through `ngModelOptions`:

```ts
// Render the parent.
const fixture = MockRender(TargetComponent);
await fixture.whenStable();
const component = fixture.point.componentInstance;

// Find the child.
const mockControlEl = ngMocks.find(CvaComponent);

// Read the value.
expect(component.value).toBeNull();

// Change the value.
ngMocks.change(mockControlEl, 'foo');

// Assert the result.
expect(component.value).toBe('foo');
```

## A child bound with signal forms

In Angular 21+, a standalone CVA child can also bind through `FormField`. Use the
standalone `CvaComponent` from the
[signal example source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/cva.spec.ts),
which selects `<name-control>`, with this parent. Import `signal` from `@angular/core`, and
`form` and `FormField` from `@angular/forms/signals`:

```ts
@Component({
  selector: 'target-signal-forms-cva',
  imports: [FormField, CvaComponent],
  template: '<name-control [formField]="f.name" />',
})
class TargetComponent {
  public readonly model = signal({ name: 'Ada' });
  public readonly f = form(this.model);
}
```

Keep the binding and its root providers real while mocking the CVA child.
Import `NG_MOCKS_ROOT_PROVIDERS` from `ng-mocks` for this setup:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent)
    .keep(FormField)
    .keep(NG_MOCKS_ROOT_PROVIDERS)
    .mock(CvaComponent),
);
```

Find the child by its class and read the parent signal for its value. Changing the
mock marks the field dirty; use `ngMocks.touch(child)` separately to report a touch:

```ts
// Render the parent.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the child.
const child = ngMocks.find(CvaComponent);

// Read the value.
expect(component.model()).toEqual({ name: 'Ada' });

// Change the value.
ngMocks.change(child, 'Katherine');

// Assert the result.
expect(component.model()).toEqual({ name: 'Katherine' });
expect(component.f.name().dirty()).toBe(true);
expect(component.f.name().touched()).toBe(false);
```

## Values written to the child {#advanced-example}

The following value, touch, and disabled-state examples use the opening reactive
form component.

To verify values sent from the parent to the child, spy on `writeValue`. Import
[`MockInstance`](/api/MockInstance.md) and call `MockInstance.scope()` inside the test
suite to reset customizations after each test.

Install the spy before rendering because Angular writes the initial value during setup:

```ts
// Prepare the writeValue spy.
const writeValue = jasmine.createSpy('writeValue');
// For Jest: const writeValue = jest.fn();
MockInstance(CvaComponent, 'writeValue', writeValue);

// Render the parent.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Assert the initial value written to the child.
expect(writeValue).toHaveBeenCalledWith(null);
```

### Parent value changes

A reactive form update calls the mocked child's `writeValue`:

```ts
// Change the parent value.
component.formControl.setValue('bar');

// Assert the value written to the child.
expect(writeValue).toHaveBeenCalledWith('bar');
```

With `ngModel`, update the parent property, run change detection, and await stability:

```ts
// Change the parent value.
component.value = 'bar';
fixture.detectChanges();
await fixture.whenStable();

// Assert the value written to the child.
expect(writeValue).toHaveBeenCalledWith('bar');
```

## Touching the child

Changing a mocked CVA does not invoke its registered touch callback.
Use [`ngMocks.touch`](/api/ngMocks/touch.md) when the test needs a touched control:

```ts
// Touch the child.
ngMocks.touch(mockControlEl);

// Assert the touched state.
expect(component.formControl.touched).toBe(true);
```

## Disabling the child

When the CVA declares `setDisabledState`, Angular calls it when the parent control
is disabled or enabled. Spy on the mock's method after rendering to observe those calls:

```ts
// Observe the child's disabled-state callback.
const setDisabledState = jasmine.createSpy('setDisabledState');
ngMocks.stubMember(
  ngMocks.get(mockControlEl, CvaComponent),
  'setDisabledState',
  setDisabledState,
);

// Disable the parent control.
component.formControl.disable();

// Assert the state sent to the child.
expect(setDisabledState).toHaveBeenCalledWith(true);

// Enable it again.
component.formControl.enable();

// Assert the state sent to the child.
expect(setDisabledState).toHaveBeenCalledWith(false);
```

## Declare the CVA contract as methods {#caution-about-controlvalueaccessor}

:::warning Use methods for the CVA contract

Declare `writeValue`, `registerOnChange`, and `registerOnTouched` as methods so `ng-mocks`
can discover the CVA contract without constructing the real child. Properties such as
`writeValue = () => {}` exist only after construction and can cause
`No value accessor for form control with name ...` when the child is mocked.

:::

## Validators and other bindings

Mock form controls also support `formControlName` and `ngModelChange`, along with
the `NG_VALUE_ACCESSOR` provider and CVA registration methods.

Mocked validator declarations support `NG_VALIDATORS` / `Validator` and
`NG_ASYNC_VALIDATORS` / `AsyncValidator`, including `validate` and
`registerOnValidatorChange`. Use
[`isMockValidator`](/api/helpers/isMockValidator.md) when accessing a mock validator's
simulation callback directly.

## Live examples {#complete-examples}

### Reactive forms

This complete example checks values flowing in both directions. Its source also contains
the separate touch and disabled-state tests.

- [Source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockReactiveForms/test.spec.ts)
- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockReactiveForms/test.spec.ts&initialpath=%3Fspec%3DMockReactiveForms)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockReactiveForms/test.spec.ts&initialpath=%3Fspec%3DMockReactiveForms)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockReactiveForms/test.spec.ts"
import { Component, forwardRef, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockInstance, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target',
  standalone: false,
  template: '<cva [formControl]="formControl"></cva>',
})
class TargetComponent {
  public readonly formControl = new FormControl();
}

@Component({
  selector: 'cva',
  standalone: false,
  template: 'dependency',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
  ],
})
class CvaComponent implements ControlValueAccessor {
  public writeValue(): void {}
  public registerOnChange(): void {}
  public registerOnTouched(): void {}
  public setDisabledState(): void {}
}

@NgModule({
  declarations: [TargetComponent, CvaComponent],
  imports: [ReactiveFormsModule],
})
class ItsModule {}

describe('MockReactiveForms', () => {
  MockInstance.scope();

  beforeEach(() =>
    MockBuilder(TargetComponent, ItsModule).keep(ReactiveFormsModule),
  );

  it('sends the correct value to the mock form component', () => {
    // Prepare the writeValue spy.
    const writeValue = jasmine.createSpy('writeValue');
    // For Jest: const writeValue = jest.fn();
    MockInstance(CvaComponent, 'writeValue', writeValue);

    // Render the parent.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the child.
    const mockControlEl = ngMocks.find(CvaComponent);

    // Read the value.
    expect(component.formControl.value).toBeNull();
    expect(writeValue).toHaveBeenCalledWith(null);

    // Change the value.
    ngMocks.change(mockControlEl, 'foo');

    // Assert the result.
    expect(component.formControl.value).toBe('foo');

    // Change the parent value.
    component.formControl.setValue('bar');

    // Assert the value written to the child.
    expect(component.formControl.value).toBe('bar');
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});
```

### ngModel

This variant uses the same CVA contract with a parent bound through `ngModel`.

- [Source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockForms/test.spec.ts)
- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockForms/test.spec.ts&initialpath=%3Fspec%3DMockForms)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockForms/test.spec.ts&initialpath=%3Fspec%3DMockForms)

### Signal forms

This variant verifies signal model writes, changes from the mocked CVA, and a separate touch.

- [Source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/cva.spec.ts)
- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestSignalForms/cva.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Acva)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestSignalForms/cva.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Acva)

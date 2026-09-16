---
title: How to mock signal form controls in Angular tests
description: Mock custom FormValueControl and FormCheckboxControl children, read their values, and test changes through a real signal form binding
sidebar_label: Signal Form Controls
---

Mock a custom signal control when testing how its parent exchanges values with it.
Keep `FormField` real so the parent form still connects to the mocked child.
Signal forms require Angular 21 or newer.

This parent binds its `inputValue` field to a child that implements `FormValueControl`:

```ts
import { Component, model, signal } from '@angular/core';
import { form, FormField, FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'mock-forms-input-control',
  template: `
    <input [value]="value()" (input)="value.set($any($event.target).value)" />
  `,
})
class InputControl implements FormValueControl<string> {
  public readonly value = model('');
}

@Component({
  selector: 'target-mock-forms-signals',
  imports: [FormField, InputControl],
  template: '<mock-forms-input-control [formField]="f.inputValue" />',
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public readonly f = form(this.model);
}
```

## Test setup

Configure the testing module in `beforeEach` with [`MockBuilder`](/api/MockBuilder.md).
Keep the parent and form binding real, and mock `InputControl`:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent)
    // Preserve the parent form connection while replacing the child.
    .keep(FormField)
    .keep(NG_MOCKS_ROOT_PROVIDERS)
    .mock(InputControl),
);
```

Keeping [`NG_MOCKS_ROOT_PROVIDERS`](/api/MockBuilder.md#ng_mocks_root_providers-token)
preserves the services used by the real form binding. Mocking `FormField` itself would
remove the connection between the parent form and the control.

## Testing the parent binding

:::warning Changing and touching are separate

`ngMocks.change` updates the custom control's value and marks its field dirty.
It does not mark the field touched. A control must expose a touch binding to support
the separate [touch interaction](#touch).

:::

Inside `it`, render the parent with [`MockRender`](/api/MockRender.md), then find the
mocked child with [`ngMocks.find`](/api/ngMocks/find.md). Read the parent's model and
the child's `value()` signal, then pass `InputControl` directly to
[`ngMocks.change`](/api/ngMocks/change.md):

```ts
// Render the parent.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the child.
const host = ngMocks.find(InputControl);
const control = ngMocks.get(host, InputControl);

// Read the value.
expect(component.model().inputValue).toBe('Ada');
expect(control.value()).toBe('Ada');

// Change the value.
ngMocks.change(InputControl, 'Grace');
// or ngMocks.change(host, 'Grace');
// Propagate the updated field value back to the child's model input.
fixture.detectChanges();

// Assert the result.
expect(component.model().inputValue).toBe('Grace');
expect(control.value()).toBe('Grace');
```

## Parent model writes

A parent write also reaches the mocked child on the next change-detection pass:

```ts
// Change the parent model.
component.model.set({ inputValue: 'Katherine' });
// Deliver the parent value to the mocked child.
fixture.detectChanges();

// Assert the result.
expect(component.model().inputValue).toBe('Katherine');
expect(control.value()).toBe('Katherine');
```

## Checkbox controls

A `FormCheckboxControl` exposes a boolean `checked` model. Pass `true` or `false`
to change the mocked child's checked state:

```ts
import { Component, model, signal } from '@angular/core';
import { form, FormCheckboxControl, FormField } from '@angular/forms/signals';

@Component({
  selector: 'mock-forms-checkbox-control',
  template: `
    <input
      type="checkbox"
      [checked]="checked()"
      (change)="checked.set($any($event.target).checked)"
    />
  `,
})
class CheckboxControl implements FormCheckboxControl {
  public readonly checked = model(false);
}

@Component({
  selector: 'target-mock-forms-checkbox-signals',
  imports: [FormField, CheckboxControl],
  template: '<mock-forms-checkbox-control [formField]="f.checkboxValue" />',
})
class TargetComponent {
  public readonly model = signal({ checkboxValue: false });
  public readonly f = form(this.model);
}
```

For this variant, mock `CheckboxControl` in the setup:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent)
    // Preserve the parent form connection while replacing the child.
    .keep(FormField)
    .keep(NG_MOCKS_ROOT_PROVIDERS)
    .mock(CheckboxControl),
);
```

Render the parent as above, then find the child and change its checked state:

```ts
// Find the child.
const host = ngMocks.find(CheckboxControl);
const control = ngMocks.get(host, CheckboxControl);

// Read the checked state.
expect(component.model().checkboxValue).toBe(false);
expect(control.checked()).toBe(false);

// Check the control.
ngMocks.change(CheckboxControl, true);
// or ngMocks.change(host, true);
fixture.detectChanges();

// Assert the result.
expect(component.model().checkboxValue).toBe(true);
expect(control.checked()).toBe(true);

// Uncheck the control.
ngMocks.change(CheckboxControl, false);
// or ngMocks.change(host, false);
fixture.detectChanges();

// Assert the result.
expect(component.model().checkboxValue).toBe(false);
expect(control.checked()).toBe(false);
```

## Touch

In Angular 22, a custom control can expose a `touch` output and a `touched` input.
[`ngMocks.touch`](/api/ngMocks/touch.md) emits the child's touch event. After change
detection, the child receives the updated touched state while its value stays unchanged.
The [touch example](#touch-example) includes that control declaration and its tests.

## Live example {#complete-example}

Here is the complete test for the value control. The
[executable spec](https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockForms/signals.spec.ts)
also checks that the field binding identifies the same mocked child.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockForms/signals.spec.ts&initialpath=%3Fspec%3DMockForms%3Asignals)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockForms/signals.spec.ts&initialpath=%3Fspec%3DMockForms%3Asignals)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockForms/signals.spec.ts"
import { Component, model, signal } from '@angular/core';
import { form, FormField, FormValueControl } from '@angular/forms/signals';

import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';

@Component({
  selector: 'mock-forms-input-control',
  template: `
    <input [value]="value()" (input)="value.set($any($event.target).value)" />
  `,
})
class InputControl implements FormValueControl<string> {
  public readonly value = model('');
}

@Component({
  selector: 'target-mock-forms-signals',
  imports: [FormField, InputControl],
  template: '<mock-forms-input-control [formField]="f.inputValue" />',
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public readonly f = form(this.model);
}

describe('MockForms:signals', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      // Preserve the parent form connection while replacing the child.
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(InputControl),
  );

  it('passes values between the parent and the mocked signal control', () => {
    // Render the parent.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the child.
    const host = ngMocks.find(InputControl);
    const control = ngMocks.get(host, InputControl);

    // Read the value.
    expect(component.model().inputValue).toBe('Ada');
    expect(control.value()).toBe('Ada');

    // Change the value.
    ngMocks.change(InputControl, 'Grace');
    // or ngMocks.change(host, 'Grace');
    // Propagate the updated field value back to the child's model input.
    fixture.detectChanges();

    // Assert the result.
    expect(component.model().inputValue).toBe('Grace');
    expect(control.value()).toBe('Grace');

    // Change the parent model.
    component.model.set({ inputValue: 'Katherine' });
    // Deliver the parent value to the mocked child.
    fixture.detectChanges();

    // Assert the result.
    expect(component.model().inputValue).toBe('Katherine');
    expect(control.value()).toBe('Katherine');
  });
});
```

### Checkbox example

The [complete checkbox spec](https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockForms/checkbox-signals.spec.ts)
also checks parent writes and emitted checked values.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockForms/checkbox-signals.spec.ts&initialpath=%3Fspec%3DMockForms%3Acheckbox-signals)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockForms/checkbox-signals.spec.ts&initialpath=%3Fspec%3DMockForms%3Acheckbox-signals)

### Touch example

The [complete Angular 22 touch spec](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/model.spec.ts)
checks changes and touch independently, including the parent's rendered value.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestSignalForms/model.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Amodel)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestSignalForms/model.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Amodel)

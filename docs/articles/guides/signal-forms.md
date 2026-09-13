---
title: How to test signal forms in Angular
description: Find signal form controls, read their values, and change native inputs, textareas, checkboxes, radios, numbers, and selects with ng-mocks
sidebar_label: Signal Forms
---

Find a signal form's input, read its model value, and change it with
[`ngMocks.change`](/api/ngMocks/change.md).
Keep `FormField` real so Angular connects the input to the model.
Signal forms require Angular 21 or newer.

This component connects an input to `f.inputValue` through `[formField]`.
The input initially displays `Ada`:

```ts
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'target-signal-forms-native',
  imports: [FormField],
  template: '<input [formField]="f.inputValue" />',
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public readonly f = form(this.model);
}
```

## Test setup

Configure the testing module in `beforeEach` with [`MockBuilder`](/api/MockBuilder.md).
Keep `TargetComponent`, `FormField`, and its root services real so Angular connects
the input and the field:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent)
    .keep(FormField)
    .keep(NG_MOCKS_ROOT_PROVIDERS),
);
```

:::warning Keep root providers real

Keep [`NG_MOCKS_ROOT_PROVIDERS`](/api/MockBuilder.md#ng_mocks_root_providers-token):
native input handling in Angular 22 needs the real root services. Without them,
an input event can fail with `validityMonitor.isBadInput is not a function`.

The token keeps root providers throughout the test. Use explicit `.mock(MyService)`
calls for application services you want to replace.

:::

## Testing the input

:::warning Blur and submission

The native signal field below updates immediately. `ngMocks.change` also includes
blur for native inputs, so the edited field becomes dirty and touched.

For [form submission](/extra/mock-ng-submit.md#signal-forms), wait for the submission
action to finish before asserting its completed result.

:::

Inside `it`, render the component with [`MockRender`](/api/MockRender.md), then use
[`ngMocks.reveal`](/api/ngMocks/reveal.md) with the same field tree that the template binds
to `formField`. Pass `component.f.inputValue` without calling it, so the selector matches
the bound field tree by reference. Read `component.model().inputValue` for the component's
model value and `input.nativeNode.value` for the displayed text:

```ts
// Render the component.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the input.
const input = ngMocks.reveal(['formField', component.f.inputValue]);

// Read the value.
expect(component.model().inputValue).toBe('Ada');
expect(input.nativeNode.value).toBe('Ada');

// Change the value.
ngMocks.change(input, 'Grace');
fixture.detectChanges();

// Assert the result.
expect(component.model().inputValue).toBe('Grace');
expect(input.nativeNode.value).toBe('Grace');
```

## Other native controls

For each recipe below, add the binding to `TargetComponent`'s template and the indicated
property to its `model` signal. Keep the same test setup and render the component as above.
Read `component.model()` for the model values and the native properties below for the displayed state.

| Control | Read | Change |
| --- | --- | --- |
| Text input or textarea | `element.value` | A string |
| Checkbox | `element.checked` | `true` to check; `false` to uncheck |
| Radio option | `element.checked` | `true` to select; `false` to uncheck |
| Number input | `element.value` (a string) | A number, or `null` / `undefined` to clear |
| Single select | `element.value` | An option's string value |

### Textarea

Add `textareaValue: 'Initial notes'` to the model. The textarea reads and writes a string:

```html
<textarea [formField]="f.textareaValue"></textarea>
```

```ts
// Find the textarea.
const textarea = ngMocks.reveal(['formField', component.f.textareaValue]);

// Read the value.
expect(component.model().textareaValue).toBe('Initial notes');
expect(textarea.nativeNode.value).toBe('Initial notes');

// Change the value.
ngMocks.change(textarea, 'Updated notes');
fixture.detectChanges();

// Assert the result.
expect(component.model().textareaValue).toBe('Updated notes');
expect(textarea.nativeNode.value).toBe('Updated notes');
```

### Checkbox

Add `checkboxValue: false` to the model. Pass `true` to check the input or `false`
to uncheck it. The field receives the boolean `checked` state:

```html
<input type="checkbox" value="yes" [formField]="f.checkboxValue" />
```

```ts
// Find the checkbox.
const checkbox = ngMocks.reveal(['formField', component.f.checkboxValue]);

// Read the checked state.
expect(component.model().checkboxValue).toBe(false);
expect(checkbox.nativeNode.checked).toBe(false);

// Check the checkbox.
ngMocks.change(checkbox, true);
fixture.detectChanges();

// Assert the result.
expect(component.model().checkboxValue).toBe(true);
expect(checkbox.nativeNode.checked).toBe(true);

// Uncheck the checkbox.
ngMocks.change(checkbox, false);
fixture.detectChanges();

// Assert the result.
expect(component.model().checkboxValue).toBe(false);
expect(checkbox.nativeNode.checked).toBe(false);
```

### Radio group

Add `radioValue: 'first'` to the model. Both options bind the same field, so use
[`ngMocks.find`](/api/ngMocks/find.md) to select the intended option by its value.
Pass `true` to select it. Passing `false` unchecks that host without clearing the
field's selected value; select another option to change the model.

```html
<input type="radio" value="first" [formField]="f.radioValue" />
<input type="radio" value="second" [formField]="f.radioValue" />
```

```ts
// Find the radio options.
const first = ngMocks.find('input[type="radio"][value="first"]');
const second = ngMocks.find('input[type="radio"][value="second"]');

// Read the checked states.
expect(component.model().radioValue).toBe('first');
expect(first.nativeElement.checked).toBe(true);
expect(second.nativeElement.checked).toBe(false);

// Select the second option.
ngMocks.change(second, true);
fixture.detectChanges();

// Assert the result.
expect(component.model().radioValue).toBe('second');
expect(first.nativeElement.checked).toBe(false);
expect(second.nativeElement.checked).toBe(true);

// Uncheck the second option.
ngMocks.change(second, false);
fixture.detectChanges();

// Assert the result.
expect(component.model().radioValue).toBe('second');
expect(first.nativeElement.checked).toBe(false);
expect(second.nativeElement.checked).toBe(false);
```

### Number input

Add `numberValue: 1 as number | null` to the model. Pass `null` or `undefined` to clear
the input; Angular writes `null` to the field and model:

```html
<input type="number" [formField]="f.numberValue" />
```

```ts
// Find the input.
const input = ngMocks.reveal(['formField', component.f.numberValue]);

// Read the value.
expect(component.model().numberValue).toBe(1);
expect(input.nativeNode.value).toBe('1');

// Change the value.
ngMocks.change(input, 42);
fixture.detectChanges();

// Assert the result.
expect(component.model().numberValue).toBe(42);
expect(input.nativeNode.value).toBe('42');

// Clear the value with null or undefined.
ngMocks.change(input, null);
fixture.detectChanges();

// Assert the result.
expect(component.model().numberValue).toBeNull();
expect(input.nativeNode.value).toBe('');
```

### Single select

Add `selectValue: 'first'` to the model. Pass an option's string value to select it:

```html
<select [formField]="f.selectValue">
  <option value="first">First</option>
  <option value="second">Second</option>
</select>
```

```ts
// Find the select.
const select = ngMocks.reveal(['formField', component.f.selectValue]);

// Read the value.
expect(component.model().selectValue).toBe('first');
expect(select.nativeNode.value).toBe('first');

// Change the value.
ngMocks.change(select, 'second');
fixture.detectChanges();

// Assert the result.
expect(component.model().selectValue).toBe('second');
expect(select.nativeNode.value).toBe('second');
expect(select.nativeNode.options[1].selected).toBe(true);
```

### Multiple select {#multiple-selections-with-a-custom-control}

Angular 22's native `FormField` select binding reads a single value. For multiple
selections, use a custom control that exchanges an array with the field. The
[executable example](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/multi-select.spec.ts)
shows selecting and clearing values through that control.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestSignalForms/multi-select.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Amulti-select)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestSignalForms/multi-select.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Amulti-select)

## Live example {#complete-example}

Here is the complete text-input example. The
[complete native-control spec](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/native.spec.ts)
also contains the other native control examples above.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestSignalForms/native.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Anative)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestSignalForms/native.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Anative)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/native.spec.ts"
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-signal-forms-native',
  imports: [FormField],
  template: '<input [formField]="f.inputValue" />',
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public readonly f = form(this.model);
}

describe('TestSignalForms:native', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS),
  );

  it('finds, reads, and changes a text field', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.reveal(['formField', component.f.inputValue]);

    // Read the value.
    expect(component.model().inputValue).toBe('Ada');
    expect(input.nativeNode.value).toBe('Ada');

    // Change the value.
    ngMocks.change(input, 'Grace');
    fixture.detectChanges();

    // Assert the result.
    expect(component.model().inputValue).toBe('Grace');
    expect(input.nativeNode.value).toBe('Grace');
  });
});
```

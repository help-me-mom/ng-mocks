---
title: How to test reactive forms in Angular
description: Find reactive form controls, read their values, and change native inputs, textareas, checkboxes, radios, numbers, and selects with ng-mocks
sidebar_label: Reactive Forms
---

Keep `ReactiveFormsModule` real to test a component's form bindings. Find the element
bound to a `FormControl`, read the control's `value`, change it, and check the updated binding.

```ts
import { Component, NgModule } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'target-reactive-forms-native',
  standalone: false,
  template: `
    <input [formControl]="inputValue" />
  `,
})
class TargetComponent {
  public readonly inputValue = new FormControl('Ada');
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}
```

## Test setup

Configure the testing module in `beforeEach` with [`MockBuilder`](/api/MockBuilder.md).
Keep `TargetComponent` and `ReactiveFormsModule` real so Angular connects the input and the `FormControl`:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent, TargetModule).keep(ReactiveFormsModule),
);
```

## Testing the input

:::warning Controls that update on blur or submit

If a `FormControl` uses `updateOn: 'submit'`, `ngMocks.change` edits the input,
but the control's `value` stays unchanged until the form is submitted.
Submit the form before asserting the new value; see [testing ngSubmit](/extra/mock-ng-submit.md).

With `updateOn: 'blur'`, the blur included in `ngMocks.change` applies the new value
during the call.

The examples below use the default update policy, which applies edits immediately.
The edited control becomes dirty and touched. Use [`ngMocks.touch`](/api/ngMocks/touch.md)
to mark it touched without editing its value.

:::

Inside `it`, render the component with [`MockRender`](/api/MockRender.md), find the bound input with
[`ngMocks.reveal`](/api/ngMocks/reveal.md), and edit it with [`ngMocks.change`](/api/ngMocks/change.md).
Pass `component.inputValue` itself to `reveal` so it matches the control bound to `[formControl]`.

Read `component.inputValue.value` for the form value and `input.nativeNode.value` for the displayed text.
The simulated native change also marks the control dirty and touched:

```ts
// Render the component.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the input.
const input = ngMocks.reveal(['formControl', component.inputValue]);

// Read the value.
expect(component.inputValue.value).toBe('Ada');
expect(input.nativeNode.value).toBe('Ada');

// Change the value.
ngMocks.change(input, 'Grace');
fixture.detectChanges();

// Assert the result.
expect(component.inputValue.value).toBe('Grace');
expect(input.nativeNode.value).toBe('Grace');
expect(component.inputValue.dirty).toBe(true);
expect(component.inputValue.touched).toBe(true);
```

## Other native controls

For each recipe below, add the shown template binding and property to `TargetComponent`.
Keep the same `ReactiveFormsModule` setup and render the component as above.
Read each `FormControl.value` for the model value and the native properties below for the displayed state.

| Control | Read | Change |
| --- | --- | --- |
| Text input or textarea | `element.value` | A string |
| Checkbox | `element.checked` | `true` to check it; `false` to uncheck it |
| Radio option | `element.checked` | `true` to select it; `false` to uncheck it |
| Number input | `element.value` (a string) | A number, or `null` / `undefined` to clear |
| Single select | `element.value` | An option's value |
| Multiple select | Each option's `selected` property | An array of option values, or `[]` to clear |

### Textarea

A textarea binds its text to a `FormControl`:

```html
<textarea [formControl]="textareaValue"></textarea>
```

```ts
public readonly textareaValue = new FormControl('Initial notes');
```

```ts
// Find the textarea.
const textarea = ngMocks.reveal(['formControl', component.textareaValue]);

// Read the value.
expect(component.textareaValue.value).toBe('Initial notes');
expect(textarea.nativeNode.value).toBe('Initial notes');

// Change the value.
ngMocks.change(textarea, 'Updated notes');
fixture.detectChanges();

// Assert the result.
expect(component.textareaValue.value).toBe('Updated notes');
expect(textarea.nativeNode.value).toBe('Updated notes');
```

### Checkbox

A checkbox binds a boolean control. Pass `true` to check it or `false` to uncheck it.
Angular writes the resulting `checked` state to the control:

```html
<input type="checkbox" value="yes" [formControl]="checkboxValue" />
```

```ts
public readonly checkboxValue = new FormControl(false);
```

```ts
// Find the checkbox.
const checkbox = ngMocks.reveal(['formControl', component.checkboxValue]);

// Read the checked state.
expect(component.checkboxValue.value).toBe(false);
expect(checkbox.nativeNode.checked).toBe(false);

// Check the checkbox.
ngMocks.change(checkbox, true);
fixture.detectChanges();

// Assert the result.
expect(component.checkboxValue.value).toBe(true);
expect(checkbox.nativeNode.checked).toBe(true);

// Uncheck the checkbox.
ngMocks.change(checkbox, false);
fixture.detectChanges();

// Assert the result.
expect(component.checkboxValue.value).toBe(false);
expect(checkbox.nativeNode.checked).toBe(false);
```

### Radio group

Both radios share `name="radioName"` and bind `radioValue`. Find the intended option and
pass `true` to select it. Angular writes the option's value to the shared `FormControl`.
Passing `false` unchecks that host without clearing the control's selected value.

```html
<input name="radioName" type="radio" value="first" [formControl]="radioValue" />
<input name="radioName" type="radio" value="second" [formControl]="radioValue" />
```

```ts
public readonly radioValue = new FormControl('first');
```

```ts
// Find the radio options.
const first = ngMocks.find('[name="radioName"][value="first"]');
const second = ngMocks.find('[name="radioName"][value="second"]');

// Read the checked states.
expect(component.radioValue.value).toBe('first');
expect(first.nativeElement.checked).toBe(true);
expect(second.nativeElement.checked).toBe(false);

// Select the second option.
ngMocks.change(second, true);
fixture.detectChanges();

// Assert the result.
expect(component.radioValue.value).toBe('second');
expect(first.nativeElement.checked).toBe(false);
expect(second.nativeElement.checked).toBe(true);
expect(first.nativeElement.value).toBe('first');
expect(second.nativeElement.value).toBe('second');

// Uncheck the second option.
ngMocks.change(second, false);
fixture.detectChanges();

// Assert the result.
expect(component.radioValue.value).toBe('second');
expect(first.nativeElement.checked).toBe(false);
expect(second.nativeElement.checked).toBe(false);
```

### Number input

Pass `null` or `undefined` to clear the input; Angular writes `null` to the control:

```html
<input type="number" [formControl]="numberValue" />
```

```ts
public readonly numberValue = new FormControl(1);
```

```ts
// Find the input.
const input = ngMocks.reveal(['formControl', component.numberValue]);

// Read the value.
expect(component.numberValue.value).toBe(1);
expect(input.nativeNode.value).toBe('1');

// Change the value.
ngMocks.change(input, 42);
fixture.detectChanges();

// Assert the result.
expect(component.numberValue.value).toBe(42);
expect(input.nativeNode.value).toBe('42');

// Clear the value with null or undefined.
ngMocks.change(input, null);
fixture.detectChanges();

// Assert the result.
expect(component.numberValue.value).toBeNull();
expect(input.nativeNode.value).toBe('');
```

### Single select

The select binds `selectValue` to one option. Pass that option's string value to change it:

```html
<select [formControl]="selectValue">
  <option value="first">First</option>
  <option value="second">Second</option>
</select>
```

```ts
public readonly selectValue = new FormControl('first');
```

```ts
// Find the select.
const select = ngMocks.reveal(['formControl', component.selectValue]);

// Read the value.
expect(component.selectValue.value).toBe('first');
expect(select.nativeNode.value).toBe('first');

// Change the value.
ngMocks.change(select, 'second');
fixture.detectChanges();

// Assert the result.
expect(component.selectValue.value).toBe('second');
expect(select.nativeNode.value).toBe('second');
expect(select.nativeNode.options[1].selected).toBe(true);
```

### Multiple select

A multiple select binds an array of option values. Read each option's `selected` state
and pass an array to change the selection, or `[]` to clear it:

```html
<select multiple [formControl]="multiSelectValue">
  <option value="first">First</option>
  <option value="second">Second</option>
  <option value="third">Third</option>
</select>
```

```ts
public readonly multiSelectValue = new FormControl(['first']);
```

```ts
// Find the select.
const select = ngMocks.reveal(['formControl', component.multiSelectValue]);

// Read the selection.
expect(component.multiSelectValue.value).toEqual(['first']);
expect(select.nativeNode.options[0].selected).toBe(true);
expect(select.nativeNode.options[1].selected).toBe(false);
expect(select.nativeNode.options[2].selected).toBe(false);

// Change the selection.
ngMocks.change(select, ['second', 'third']);
fixture.detectChanges();

// Assert the result.
expect(component.multiSelectValue.value).toEqual(['second', 'third']);
expect(select.nativeNode.options[0].selected).toBe(false);
expect(select.nativeNode.options[1].selected).toBe(true);
expect(select.nativeNode.options[2].selected).toBe(true);

// Clear the selection.
ngMocks.change(select, []);
fixture.detectChanges();

// Assert the result.
expect(component.multiSelectValue.value).toEqual([]);
expect(select.nativeNode.options[0].selected).toBe(false);
expect(select.nativeNode.options[1].selected).toBe(false);
expect(select.nativeNode.options[2].selected).toBe(false);
expect(component.inputValue.value).toBe('Ada');
```

## Live example {#complete-example}

Here is the complete text-input example. The
[executable spec](https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockReactiveForms/native.spec.ts)
also contains the other six control types and checks that changing one leaves other form values and state unchanged.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockReactiveForms/native.spec.ts&initialpath=%3Fspec%3DMockReactiveForms%3Anative)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockReactiveForms/native.spec.ts&initialpath=%3Fspec%3DMockReactiveForms%3Anative)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockReactiveForms/native.spec.ts"
import { Component, NgModule } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-reactive-forms-native',
  standalone: false,
  template: `
    <input [formControl]="inputValue" />
  `,
})
class TargetComponent {
  public readonly inputValue = new FormControl('Ada');
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('MockReactiveForms:native', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(ReactiveFormsModule),
  );

  it('finds, reads, and changes a text control', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.reveal(['formControl', component.inputValue]);

    // Read the value.
    expect(component.inputValue.value).toBe('Ada');
    expect(input.nativeNode.value).toBe('Ada');

    // Change the value.
    ngMocks.change(input, 'Grace');
    fixture.detectChanges();

    // Assert the result.
    expect(component.inputValue.value).toBe('Grace');
    expect(input.nativeNode.value).toBe('Grace');
    expect(component.inputValue.dirty).toBe(true);
    expect(component.inputValue.touched).toBe(true);
  });
});
```

---
title: How to test ngModel in Angular
description: Find native ngModel controls, read their values, and change text, checkbox, radio, number, and select inputs with ng-mocks
sidebar_label: ngModel
---

Keep `FormsModule` real to test how `[(ngModel)]` connects a native control to the component.
The test finds the control, reads its current value, changes it, and checks the updated binding.

```ts
import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'target-mock-forms-native',
  standalone: false,
  template: `
    <input name="inputName" [(ngModel)]="inputValue" />
  `,
})
class TargetComponent {
  public inputValue = 'Ada';
}

@NgModule({
  declarations: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}
```

## Test setup

Configure the testing module in `beforeEach` with [`MockBuilder`](/api/MockBuilder.md).
Keep `TargetComponent` and `FormsModule` real so Angular connects the input and the component property:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
);
```

## Testing the input

:::warning Controls that update on blur or submit

If `ngModelOptions` sets `updateOn: 'submit'`, `ngMocks.change` edits the input,
but the component property keeps its previous value until the form is submitted.
Submit the form before asserting the new value; see [testing ngSubmit](/extra/mock-ng-submit.md).

With `updateOn: 'blur'`, the blur included in `ngMocks.change` applies the new value
during the call.

The examples below use the default update policy, which applies edits immediately.
The edited control becomes dirty and touched. Use [`ngMocks.touch`](/api/ngMocks/touch.md)
to mark it touched without editing its value.

:::

Inside an async `it`, render the component with [`MockRender`](/api/MockRender.md), find the input with
[`ngMocks.find`](/api/ngMocks/find.md), and edit it with [`ngMocks.change`](/api/ngMocks/change.md).
`name="inputName"` identifies the control; `[(ngModel)]="inputValue"` binds its value to the component property.

Wait for the fixture to settle after rendering and editing, then check the component property and displayed text:

```ts
// Render the component.
const fixture = MockRender(TargetComponent);
await fixture.whenStable();
const component = fixture.point.componentInstance;

// Find the input.
const input = ngMocks.find('[name="inputName"]');

// Read the value.
expect(component.inputValue).toBe('Ada');
expect(input.nativeElement.value).toBe('Ada');

// Change the value.
ngMocks.change(input, 'Grace');
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.inputValue).toBe('Grace');
expect(input.nativeElement.value).toBe('Grace');
```

## Other native controls

For each recipe below, add the shown template binding and property to `TargetComponent`.
Keep the same `FormsModule` setup and render the component in an async test as above.
Read the component property for the model value and the native properties below for the displayed state.

| Control | Read | Change |
| --- | --- | --- |
| Text input or textarea | `element.value` | A string |
| Checkbox | `element.checked` | `true` to check it; `false` to uncheck it |
| Radio option | `element.checked` | `true` to select it; `false` to uncheck it |
| Number input | `element.value` (a string) | A number, or `null` / `undefined` to clear |
| Single select | `element.value` | An option's value |
| Multiple select | Each option's `selected` property | An array of option values, or `[]` to clear |

### Textarea

A textarea binds its text to `textareaValue`:

```html
<textarea name="textareaName" [(ngModel)]="textareaValue"></textarea>
```

```ts
public textareaValue = 'Notes';
```

```ts
// Find the textarea.
const textarea = ngMocks.find('[name="textareaName"]');

// Read the value.
expect(component.textareaValue).toBe('Notes');
expect(textarea.nativeElement.value).toBe('Notes');

// Change the value.
ngMocks.change(textarea, 'Updated notes');
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.textareaValue).toBe('Updated notes');
expect(textarea.nativeElement.value).toBe('Updated notes');
```

### Checkbox

A checkbox binds a boolean property. Pass `true` to check it or `false` to uncheck it.
Angular writes the resulting `checked` state to the property:

```html
<input name="checkboxName" type="checkbox" value="yes" [(ngModel)]="checkboxValue" />
```

```ts
public checkboxValue = false;
```

```ts
// Find the checkbox.
const checkbox = ngMocks.find('[name="checkboxName"]');

// Read the checked state.
expect(component.checkboxValue).toBe(false);
expect(checkbox.nativeElement.checked).toBe(false);

// Check the checkbox.
ngMocks.change(checkbox, true);
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.checkboxValue).toBe(true);
expect(checkbox.nativeElement.checked).toBe(true);

// Uncheck the checkbox.
ngMocks.change(checkbox, false);
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.checkboxValue).toBe(false);
expect(checkbox.nativeElement.checked).toBe(false);
```

### Radio group

Both radios share `name="radioName"` and bind `radioValue`. Find the intended option and
pass `true` to select it. Angular writes the option's value to `radioValue`.
Passing `false` unchecks that host without clearing the model's selected value.

```html
<input name="radioName" type="radio" value="first" [(ngModel)]="radioValue" />
<input name="radioName" type="radio" value="second" [(ngModel)]="radioValue" />
```

```ts
public radioValue = 'first';
```

```ts
// Find the radio options.
const first = ngMocks.find('[name="radioName"][value="first"]');
const second = ngMocks.find('[name="radioName"][value="second"]');

// Read the checked states.
expect(component.radioValue).toBe('first');
expect(first.nativeElement.checked).toBe(true);
expect(second.nativeElement.checked).toBe(false);

// Select the second option.
ngMocks.change(second, true);
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.radioValue).toBe('second');
expect(first.nativeElement.checked).toBe(false);
expect(second.nativeElement.checked).toBe(true);
expect(first.nativeElement.value).toBe('first');
expect(second.nativeElement.value).toBe('second');

// Uncheck the second option.
ngMocks.change(second, false);
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.radioValue).toBe('second');
expect(first.nativeElement.checked).toBe(false);
expect(second.nativeElement.checked).toBe(false);
```

### Number input

Pass `null` or `undefined` to clear the input; Angular writes `null` to the component property:

```html
<input name="numberName" type="number" [(ngModel)]="numberValue" />
```

```ts
public numberValue: number | null = 1;
```

```ts
// Find the input.
const input = ngMocks.find('[name="numberName"]');

// Read the value.
expect(component.numberValue).toBe(1);
expect(input.nativeElement.value).toBe('1');

// Change the value.
ngMocks.change(input, 23.5);
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.numberValue).toBe(23.5);
expect(input.nativeElement.value).toBe('23.5');

// Clear the value with null or undefined.
ngMocks.change(input, null);
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.numberValue).toBeNull();
expect(input.nativeElement.value).toBe('');
```

### Single select

The select binds `selectValue` to one option. Pass that option's string value to change it:

```html
<select name="selectName" [(ngModel)]="selectValue">
  <option value="first">First</option>
  <option value="second">Second</option>
</select>
```

```ts
public selectValue = 'first';
```

```ts
// Find the select.
const select = ngMocks.find('[name="selectName"]');

// Read the value.
expect(component.selectValue).toBe('first');
expect(select.nativeElement.value).toBe('first');

// Change the value.
ngMocks.change(select, 'second');
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.selectValue).toBe('second');
expect(select.nativeElement.value).toBe('second');
expect(select.nativeElement.options[0].selected).toBe(false);
expect(select.nativeElement.options[1].selected).toBe(true);
```

### Multiple select

A multiple select binds an array of option values. Read each option's `selected` state
and pass an array to change the selection, or `[]` to clear it:

```html
<select name="multiSelectName" multiple [(ngModel)]="multiSelectValue">
  <option value="first">First</option>
  <option value="second">Second</option>
  <option value="third">Third</option>
</select>
```

```ts
public multiSelectValue: string[] = ['first'];
```

```ts
// Find the select.
const select = ngMocks.find('[name="multiSelectName"]');

// Read the selection.
expect(component.multiSelectValue).toEqual(['first']);
expect(select.nativeElement.options[0].selected).toBe(true);
expect(select.nativeElement.options[1].selected).toBe(false);
expect(select.nativeElement.options[2].selected).toBe(false);

// Change the selection.
ngMocks.change(select, ['second', 'third']);
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.multiSelectValue).toEqual(['second', 'third']);
expect(select.nativeElement.options[0].selected).toBe(false);
expect(select.nativeElement.options[1].selected).toBe(true);
expect(select.nativeElement.options[2].selected).toBe(true);

// Clear the selection.
ngMocks.change(select, []);
fixture.detectChanges();
await fixture.whenStable();

// Assert the result.
expect(component.multiSelectValue).toEqual([]);
expect(select.nativeElement.options[0].selected).toBe(false);
expect(select.nativeElement.options[1].selected).toBe(false);
expect(select.nativeElement.options[2].selected).toBe(false);
expect(component.inputValue).toBe('Ada');
```

## Live example {#complete-example}

Here is the complete text-input example. The
[executable spec](https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockForms/native.spec.ts)
also contains the other six control types and checks that changing one leaves other model values unchanged.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockForms/native.spec.ts&initialpath=%3Fspec%3DMockForms%3Anative)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockForms/native.spec.ts&initialpath=%3Fspec%3DMockForms%3Anative)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockForms/native.spec.ts"
import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-forms-native',
  standalone: false,
  template: `
    <input name="inputName" [(ngModel)]="inputValue" />
  `,
})
class TargetComponent {
  public inputValue = 'Ada';
}

@NgModule({
  declarations: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}

describe('MockForms:native', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
  );

  it('reads and changes a text input', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.find('[name="inputName"]');

    // Read the value.
    expect(component.inputValue).toBe('Ada');
    expect(input.nativeElement.value).toBe('Ada');

    // Change the value.
    ngMocks.change(input, 'Grace');
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.inputValue).toBe('Grace');
    expect(input.nativeElement.value).toBe('Grace');
  });
});
```

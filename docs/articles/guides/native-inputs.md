---
title: How to test native inputs in Angular
description: Find, read, change, and assert native inputs, textareas, checkboxes, radios, and selects with ng-mocks
sidebar_label: Native Inputs
---

Use [`ngMocks.find`](/api/ngMocks/find.md) to inspect a native control's DOM properties.
[`ngMocks.change`](/api/ngMocks/change.md) accepts a CSS selector directly to edit the control.
This works with ordinary HTML controls, including controls without an Angular forms
directive or event handler.

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'target-native-form-controls',
  template: `
    <input #input name="inputName" [value]="inputValue" (input)="inputValue = input.value" />
  `,
})
class TargetComponent {
  public inputValue = 'Ada';
}
```

## Test setup

Configure the testing module in `beforeEach` with [`MockBuilder`](/api/MockBuilder.md).
Pass `TargetComponent` to keep it real. This component uses only native HTML elements,
so no additional dependencies are needed:

```ts
beforeEach(() => MockBuilder(TargetComponent));
```

## Testing the input

:::warning Controls that update on blur or submit

`ngMocks.change` includes blur for native inputs, so a handler that saves the value
on blur runs during the call. If the component saves the value only when the form
is submitted, submit the form before asserting that saved value.

The example below saves the value through its `input` handler, so `inputValue`
updates immediately.

:::

Inside `it`, render the component with [`MockRender`](/api/MockRender.md).
Then find the input, read its initial value, change it, and check the input and component:

```ts
// Render the component.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the input.
const input = ngMocks.find('[name="inputName"]');

// Read the value.
expect(input.nativeElement.value).toBe('Ada');
expect(component.inputValue).toBe('Ada');

// Change the value.
ngMocks.change('[name="inputName"]', 'Grace');
// or ngMocks.change(input, 'Grace');
fixture.detectChanges();

// Assert the result.
expect(input.nativeElement.value).toBe('Grace');
expect(component.inputValue).toBe('Grace');
```

## Other native controls

These controls need no forms module. Put the desired template inside a component,
render it with `MockRender`, then use the matching test steps below.

| Control | Read | Change |
| --- | --- | --- |
| Text input or textarea | `element.value` | A string |
| Checkbox | `element.checked` | `true` to check it; `false` to uncheck it |
| Radio option | `element.checked` | `true` to select it; `false` to uncheck it |
| Number input | `element.value` (a string) | A number, or `null` / `undefined` to clear |
| Single select | `element.value` | An option's value |
| Multiple select | Each option's `selected` property | An array of option values |

### Plain text input

```html
<input name="inputName" value="Ada" />
```

```ts
// Find the input.
const input = ngMocks.find('[name="inputName"]');

// Read the value.
expect(input.nativeElement.value).toBe('Ada');

// Change the value.
ngMocks.change('[name="inputName"]', 'Grace');
// or ngMocks.change(input, 'Grace');

// Assert the result.
expect(input.nativeElement.value).toBe('Grace');
```

### Textarea

```html
<textarea name="textareaName">Initial notes</textarea>
```

```ts
// Find the textarea.
const textarea = ngMocks.find('[name="textareaName"]');

// Read the value.
expect(textarea.nativeElement.value).toBe('Initial notes');

// Change the value.
ngMocks.change('[name="textareaName"]', 'Updated notes');
// or ngMocks.change(textarea, 'Updated notes');

// Assert the result.
expect(textarea.nativeElement.value).toBe('Updated notes');
```

### Checkbox

Pass `true` to check the checkbox or `false` to uncheck it.
Read its boolean state through `checked`; its `value` stays unchanged.

```html
<input name="checkboxName" type="checkbox" value="yes" />
```

```ts
// Find the checkbox.
const checkbox = ngMocks.find('[name="checkboxName"]');

// Read the checked state.
expect(checkbox.nativeElement.checked).toBe(false);

// Check the checkbox.
ngMocks.change('[name="checkboxName"]', true);
// or ngMocks.change(checkbox, true);

// Assert the result.
expect(checkbox.nativeElement.checked).toBe(true);
expect(checkbox.nativeElement.value).toBe('yes');

// Uncheck the checkbox.
ngMocks.change('[name="checkboxName"]', false);
// or ngMocks.change(checkbox, false);

// Assert the result.
expect(checkbox.nativeElement.checked).toBe(false);
expect(checkbox.nativeElement.value).toBe('yes');
```

### Radio group

Both radios share a `name`. Use the intended option's selector and pass `true` to select it.
This unchecks the other option without changing either option's `value`.
Passing `false` unchecks only the selected host; it does not select another option.

```html
<input name="radioName" type="radio" value="first" checked />
<input name="radioName" type="radio" value="second" />
```

```ts
// Find the radio options.
const first = ngMocks.find('[name="radioName"][value="first"]');
const second = ngMocks.find('[name="radioName"][value="second"]');

// Read the checked states.
expect(first.nativeElement.checked).toBe(true);
expect(second.nativeElement.checked).toBe(false);

// Select the second option.
ngMocks.change('[name="radioName"][value="second"]', true);
// or ngMocks.change(second, true);

// Assert the result.
expect(first.nativeElement.checked).toBe(false);
expect(second.nativeElement.checked).toBe(true);
expect(first.nativeElement.value).toBe('first');
expect(second.nativeElement.value).toBe('second');

// Uncheck the second option.
ngMocks.change('[name="radioName"][value="second"]', false);
// or ngMocks.change(second, false);

// Assert the result.
expect(first.nativeElement.checked).toBe(false);
expect(second.nativeElement.checked).toBe(false);
```

### Number input

```html
<input name="numberName" type="number" value="1" />
```

```ts
// Find the input.
const input = ngMocks.find('[name="numberName"]');

// Read the value.
expect(input.nativeElement.value).toBe('1');

// Change the value.
ngMocks.change('[name="numberName"]', 42);
// or ngMocks.change(input, 42);

// Assert the result.
expect(input.nativeElement.value).toBe('42');

// Clear the value with null or undefined.
ngMocks.change('[name="numberName"]', null);
// or ngMocks.change(input, null);

// Assert the result.
expect(input.nativeElement.value).toBe('');
```

### Single select

```html
<select name="selectName">
  <option value="first">First</option>
  <option value="second">Second</option>
</select>
```

```ts
// Find the select.
const select = ngMocks.find('[name="selectName"]');

// Read the value.
expect(select.nativeElement.value).toBe('first');

// Change the value.
ngMocks.change('[name="selectName"]', 'second');
// or ngMocks.change(select, 'second');

// Assert the result.
expect(select.nativeElement.value).toBe('second');
expect(select.nativeElement.options[1].selected).toBe(true);
```

### Multiple select

Read each option's `selected` state and pass an array of values to change the selection.

```html
<select name="multiSelectName" multiple>
  <option value="first" selected>First</option>
  <option value="second">Second</option>
  <option value="third">Third</option>
</select>
```

```ts
// Find the select.
const select = ngMocks.find('[name="multiSelectName"]');
const options = select.nativeElement.options;

// Read the selection.
expect(options[0].selected).toBe(true);
expect(options[1].selected).toBe(false);
expect(options[2].selected).toBe(false);

// Change the selection.
ngMocks.change('[name="multiSelectName"]', ['second', 'third']);
// or ngMocks.change(select, ['second', 'third']);

// Assert the result.
expect(options[0].selected).toBe(false);
expect(options[1].selected).toBe(true);
expect(options[2].selected).toBe(true);

// Clear the selection.
ngMocks.change('[name="multiSelectName"]', []);
// or ngMocks.change(select, []);

// Assert the result.
expect(select.nativeElement.selectedIndex).toBe(-1);
```

## Live example {#complete-example}

Here is the complete test for the component connected through its input event.
The [executable spec](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestNativeFormControls/test.spec.ts)
also contains the other native control examples above.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestNativeFormControls/test.spec.ts&initialpath=%3Fspec%3DTestNativeFormControls)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestNativeFormControls/test.spec.ts&initialpath=%3Fspec%3DTestNativeFormControls)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestNativeFormControls/test.spec.ts"
import { Component } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-native-form-controls',
  template: `
    <input #input name="inputName" [value]="inputValue" (input)="inputValue = input.value" />
  `,
})
class TargetComponent {
  public inputValue = 'Ada';
}

describe('TestNativeFormControls', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('finds, reads, and changes an input connected through native events', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.find('[name="inputName"]');

    // Read the value.
    expect(input.nativeElement.value).toBe('Ada');
    expect(component.inputValue).toBe('Ada');

    // Change the value.
    ngMocks.change('[name="inputName"]', 'Grace');
    // or ngMocks.change(input, 'Grace');
    fixture.detectChanges();

    // Assert the result.
    expect(input.nativeElement.value).toBe('Grace');
    expect(component.inputValue).toBe('Grace');
  });
});
```

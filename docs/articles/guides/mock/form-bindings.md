---
title: How to mock Angular form bindings
description: Read mocked ngModel, formControl, formControlName, and FormField inputs and test the parent component's bindings
sidebar_label: Form Bindings
---

Mock form directives to test the values and output bindings supplied by a parent component.
For example, this component passes `inputValue` to `NgModel` and receives its `ngModelChange` output:

```ts
import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'target-mock-form-bindings',
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

Pass the component and its module to [`MockBuilder`](/api/MockBuilder.md).
This keeps `TargetComponent` real and mocks its dependencies, including the form directives:

```ts
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

## Testing the binding

Render with [`MockRender`](/api/MockRender.md), find the input with
[`ngMocks.find`](/api/ngMocks/find.md), and read the mocked directive's input with
[`ngMocks.input`](/api/ngMocks/input.md).
[`ngMocks.change`](/api/ngMocks/change.md) emits the mocked `NgModel` directive's
`ngModelChange` output, which updates the parent property:

```ts
// Render the component.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the input to inspect its mocked binding and native value.
const input = ngMocks.find('[name="inputName"]');

// Read the binding.
expect(ngMocks.input(input, 'ngModel')).toBe('Ada');
expect(component.inputValue).toBe('Ada');
expect(input.nativeElement.value).toBe('');

// Emit the mocked ngModelChange output to update the parent property.
ngMocks.change('[name="inputName"]', 'Grace');
// or ngMocks.change(input, 'Grace');
fixture.detectChanges();

// Assert the result.
expect(component.inputValue).toBe('Grace');
expect(ngMocks.input(input, 'ngModel')).toBe('Grace');
```

The initial native value is empty because the mocked directive does not connect the
component property to the DOM. A later parent write updates the mock's input when the
component is checked, but does not update the native value. After assigning a parent
property directly, mark its view for checking before `fixture.detectChanges()`, as shown
in the executable spec. To test the native connection and control state, keep the forms
module real as shown in the [ngModel](/guides/ng-model.md) and
[reactive forms](/guides/reactive-forms.md) guides.

## Reactive controls

For `<input [formControl]="inputValue">`, create `inputValue = new FormControl('Ada')`
in the component and import `ReactiveFormsModule` in its module. Use the same
`MockBuilder(TargetComponent, TargetModule)` setup to mock the form directives.

The mocked `FormControlDirective` receives the real control object created by the component.
Find that input with [`ngMocks.reveal`](/api/ngMocks/reveal.md).
`ngMocks.change` calls `setValue` on the supplied control; its `valueChanges` subscribers
still receive the update:

```ts
// Render the component.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the input.
const input = ngMocks.reveal(['formControl', component.inputValue]);

// Read the binding and its real control value.
expect(ngMocks.input(input, 'formControl')).toBe(component.inputValue);
expect(component.inputValue.value).toBe('Ada');

// Change the supplied FormControl.
ngMocks.change(input, 'Grace');

// Assert the result.
expect(component.inputValue.value).toBe('Grace');
expect(ngMocks.input(input, 'formControl')).toBe(component.inputValue);
```

This does not restore the directive's native input connection. Later calls to the
parent control's `setValue` update the control, but leave the native input unchanged.

## Named controls and groups

A mocked `FormGroupDirective` receives the group's reference, and a mocked
`FormControlName` receives the control's name:

```html
<form [formGroup]="form">
  <input formControlName="inputValue" />
</form>
```

```ts
public readonly form = new FormGroup({
  inputValue: new FormControl('Ada'),
});
```

With `MockBuilder(TargetComponent, TargetModule)`, the mocked directives do not resolve
that name to the control in the group. The input has a mocked value accessor, so
`ngMocks.change` changes its native value while leaving the group unchanged:

```ts
// Render the component.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the bound group and named input.
const form = ngMocks.reveal(['formGroup', component.form]);
const input = ngMocks.reveal(['formControlName', 'inputValue']);

// Read the bindings.
expect(ngMocks.input(form, 'formGroup')).toBe(component.form);
expect(ngMocks.input(input, 'formControlName')).toBe('inputValue');

// Change the native input through its mocked value accessor.
ngMocks.change(input, 'Grace');
fixture.detectChanges();

// Assert that the DOM change did not update the group.
expect(component.form.value).toEqual({ inputValue: 'Ada' });
expect(ngMocks.input(form, 'formGroup')).toBe(component.form);
expect(ngMocks.input(input, 'formControlName')).toBe('inputValue');
expect(input.nativeNode.value).toBe('Grace');
```

## Signal fields

With Angular 21 or later, a mocked `FormField` receives the real field tree created by
the parent. This component passes `f.inputValue` to the directive:

```ts
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'target-mock-form-bindings-signals',
  imports: [FormField],
  template: '<input [formField]="f.inputValue" />',
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public readonly f = form(this.model);
}
```

Mock the directive in the setup:

```ts
beforeEach(() => MockBuilder(TargetComponent).mock(FormField));
```

Find the input with [`ngMocks.reveal`](/api/ngMocks/reveal.md) and reuse the returned host.
`ngMocks.change` updates the supplied field and marks it dirty.
Use [`ngMocks.touch`](/api/ngMocks/touch.md) separately to mark it touched:

```ts
// Render the component.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the input by its field tree.
const input = ngMocks.reveal(['formField', component.f.inputValue]);

// Read the binding and the parent model.
expect(ngMocks.input(input, 'formField')).toBe(component.f.inputValue);
expect(component.model()).toEqual({ inputValue: 'Ada' });
expect(input.nativeNode.value).toBe('');
expect(component.f.inputValue().dirty()).toBe(false);
expect(component.f.inputValue().touched()).toBe(false);

// Change the supplied field without restoring the mocked DOM connection.
ngMocks.change(input, 'Grace');

// Assert the model update and dirty state; changing the binding does not touch it.
expect(component.model()).toEqual({ inputValue: 'Grace' });
expect(ngMocks.input(input, 'formField')).toBe(component.f.inputValue);
expect(input.nativeNode.value).toBe('');
expect(component.f.inputValue().dirty()).toBe(true);
expect(component.f.inputValue().touched()).toBe(false);

// Touch the supplied field explicitly without dispatching a native blur event.
ngMocks.touch(input);

expect(component.f.inputValue().touched()).toBe(true);
expect(component.f.inputValue().dirty()).toBe(true);
expect(component.model()).toEqual({ inputValue: 'Grace' });
expect(ngMocks.input(input, 'formField')).toBe(component.f.inputValue);
expect(input.nativeNode.value).toBe('');
```

Pass `f.inputValue` itself to `reveal`, rather than the field state returned by
`f.inputValue()`. The helper calls the field's `controlValue.set`, so Angular's debounce
policy still applies. With `debounce(path, 'blur')`, the edit stays pending until
`ngMocks.touch` calls `markAsTouched` and flushes it. Touching a pristine field alone
does not change its value or mark it dirty.

These operations update the supplied field without synchronizing native values,
calling a custom control's `writeValue`, or connecting its model inputs and outputs.
Later parent writes also leave the native input unchanged. Keep `FormField` real to
test the complete Angular connection, as shown in the [signal forms guide](/guides/signal-forms.md).

## Live examples

Each variant has a complete executable spec:

- Reactive controls: [source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockFormBindings/reactive.spec.ts), [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockFormBindings/reactive.spec.ts&initialpath=%3Fspec%3DMockFormBindings%3Areactive), [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockFormBindings/reactive.spec.ts&initialpath=%3Fspec%3DMockFormBindings%3Areactive).
- Named controls and groups: [source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockFormBindings/groups.spec.ts), [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockFormBindings/groups.spec.ts&initialpath=%3Fspec%3DMockFormBindings%3Agroups), [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockFormBindings/groups.spec.ts&initialpath=%3Fspec%3DMockFormBindings%3Agroups).
- Signal fields: [source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockFormBindings/signals.spec.ts), [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockFormBindings/signals.spec.ts&initialpath=%3Fspec%3DMockFormBindings%3Asignals), [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockFormBindings/signals.spec.ts&initialpath=%3Fspec%3DMockFormBindings%3Asignals).

Here is the complete primary `NgModel` example. Its
[executable spec](https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockFormBindings/test.spec.ts)
also checks later parent writes.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockFormBindings/test.spec.ts&initialpath=%3Fspec%3DMockFormBindings)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockFormBindings/test.spec.ts&initialpath=%3Fspec%3DMockFormBindings)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockFormBindings/test.spec.ts"
import { Component, NgModule } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-form-bindings',
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

describe('MockFormBindings', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('reads a mocked ngModel input and updates its parent binding', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input to inspect its mocked binding and native value.
    const input = ngMocks.find('[name="inputName"]');

    // Read the binding.
    expect(isMockOf(ngMocks.get(input, NgModel), NgModel)).toBe(true);
    expect(ngMocks.input(input, 'ngModel')).toBe('Ada');
    expect(component.inputValue).toBe('Ada');
    expect(input.nativeElement.value).toBe('');

    // Emit the mocked ngModelChange output to update the parent property.
    ngMocks.change('[name="inputName"]', 'Grace');
    // or ngMocks.change(input, 'Grace');
    fixture.detectChanges();

    // Assert the result.
    expect(component.inputValue).toBe('Grace');
    expect(ngMocks.input(input, 'ngModel')).toBe('Grace');
  });
});
```

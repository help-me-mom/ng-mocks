---
title: How to test signal forms in Angular
description: Test signal form validation, field state, model updates, and mocked ControlValueAccessor or FormValueControl dependencies with ng-mocks
sidebar_label: Signal Forms
---

When testing a component that owns a signal form, keep the form binding real so the test
can observe how input events update the model, validation, and rendered feedback.
Application controls can still be mocked when their implementation is outside the test's scope.

The examples below use Angular 22 and Jasmine. They cover a native text input and
custom controls that implement `ControlValueAccessor` or `FormValueControl`.

## Related tools

- [`MockBuilder`](/api/MockBuilder.md)
- [`MockRender`](/api/MockRender.md)
- [`ngMocks.find`](/api/ngMocks/find.md)
- [`ngMocks.findAll`](/api/ngMocks/findAll.md)
- [`ngMocks.change`](/api/ngMocks/change.md)
- [`ngMocks.touch`](/api/ngMocks/touch.md)
- [`MockInstance`](/api/MockInstance.md)

## Keep the form binding and its services

`MockBuilder(TargetComponent)` mocks the imports of a standalone component by default.
Keep `FormField` to connect `[formField]` to the real field state. Also keep
[`NG_MOCKS_ROOT_PROVIDERS`](/api/MockBuilder.md#ng_mocks_root_providers-token):
native input handling in Angular 22 depends on root services that must retain their real implementations.
Without them, an input event can fail with `validityMonitor.isBadInput is not a function`.

```ts
beforeEach(() =>
  MockBuilder(TargetComponent)
    .keep(FormField)
    .keep(NG_MOCKS_ROOT_PROVIDERS),
);
```

Keeping this token affects root providers throughout the test. Use explicit `.mock(MyService)`
calls for application services you want to replace.

## Select fields after migrating from classic forms

When replacing `formControlName` with `[formField]`, update selectors that depended on the
old attribute. The new binding does not recreate it:

```html
<!-- Before -->
<input formControlName="firstName" />

<!-- After -->
<input data-testid="first-name" [formField]="f.firstName" />
```

```ts
// Before
ngMocks.find('[formControlName="firstName"]');

// After
ngMocks.find('[data-testid="first-name"]');
```

For multiple native fields, give each one an explicit attribute such as `data-testid`.
The real `FormField` generates native `name` attributes, but tests do not need to depend
on their generated formatting. With a mocked `FormField`, those generated attributes are
absent; explicit attributes from your template remain available.

Finding an element and exercising its form binding are separate concerns. Keep `FormField`
and its root services when using `ngMocks.change` to update the form. An explicit selector
still works with a mocked binding, but it does not restore form behavior.

This example selects the first name and verifies that the last name stays unchanged:

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestSignalForms/selectors.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Aselectors)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestSignalForms/selectors.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Aselectors)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/selectors.spec.ts"
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-signal-forms-selectors',
  imports: [FormField],
  template: `
    <input data-testid="first-name" [formField]="f.firstName" />
    <input data-testid="last-name" [formField]="f.lastName" />
  `,
})
class TargetComponent {
  public readonly model = signal({ firstName: 'Ada', lastName: 'Lovelace' });
  public readonly f = form(this.model);
}

describe('TestSignalForms:selectors', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS),
  );

  it('changes only the selected field', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const first = ngMocks.find<HTMLInputElement>('[data-testid="first-name"]');
    const last = ngMocks.find<HTMLInputElement>('[data-testid="last-name"]');

    expect(ngMocks.findAll('[formControlName]')).toEqual([]);
    expect(first.nativeElement.value).toBe('Ada');
    expect(last.nativeElement.value).toBe('Lovelace');

    ngMocks.change(first, 'Grace');
    fixture.detectChanges();

    expect(component.model()).toEqual({ firstName: 'Grace', lastName: 'Lovelace' });
    expect(first.nativeElement.value).toBe('Grace');
    expect(last.nativeElement.value).toBe('Lovelace');
    expect(component.f.firstName().dirty()).toBe(true);
    expect(component.f.lastName().dirty()).toBe(false);
    expect(component.f.lastName().touched()).toBe(false);
  });
});
```

### Select custom control hosts

A custom `FormValueControl` can declare an optional `name` input. `FormField` writes the
field name into that input, but does not automatically add a DOM `name` attribute to the
component host. A selector such as `signal-text-control[name]` therefore finds nothing
unless the component or template explicitly adds that attribute.

For example, this control receives its name without reflecting it to the DOM:

```ts
import { Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'signal-text-control',
  template: '{{ value() }}',
})
class TextControl implements FormValueControl<string> {
  public readonly value = model('');
  public readonly name = input('');
}
```

Use `ngMocks.find(TextControl)` when there is one instance, or `ngMocks.findAll(TextControl)`
to find all instances. Give repeated controls explicit attributes to select a particular field:

```html
<signal-text-control data-testid="first-name" [formField]="f.firstName" />
<signal-text-control data-testid="last-name" [formField]="f.lastName" />
```

```ts
const first = ngMocks.find('[data-testid="first-name"]');
const control = ngMocks.get(first, TextControl);

expect(control.name()).toBe(component.f.firstName().name());
expect(ngMocks.findAll('signal-text-control[name]')).toEqual([]);

ngMocks.change(first, 'Grace');
fixture.detectChanges();

expect(component.model()).toEqual({ firstName: 'Grace', lastName: 'Lovelace' });
```

These selectors work for real and mocked child controls. Keep the parent component and
`FormField` real in either case. The complete example below covers both setups and verifies
that the sibling control keeps its value and remains pristine and untouched.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestSignalForms/selectors-model.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Aselectors-model)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestSignalForms/selectors-model.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Aselectors-model)

## Test validation and rendered feedback

This form requires a name. Its Save button is disabled while the form is invalid,
but its validation message appears only after the name field is touched.

```ts
import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'target-signal-forms',
  imports: [FormField],
  template: `
    <label>
      Name
      <input [formField]="profile.name" />
    </label>
    @if (profile.name().touched()) {
      @for (error of profile.name().errors(); track error.kind) {
        <span role="alert">{{ error.message }}</span>
      }
    }
    <button type="submit" [disabled]="profile().invalid()">Save</button>
  `,
})
class TargetComponent {
  public readonly model = signal({ name: '' });
  public readonly profile = form(this.model, schema => {
    required(schema.name, { message: 'Name is required' });
  });
}
```

The tests check both field state and visible feedback. A touch reveals the error without
changing the value or making the field dirty. Editing the input then clears the error
and enables Save. Call `fixture.detectChanges()` after each interaction to update the template.

The last test exercises the other direction: updating the model should render a new input
value while leaving the field pristine and untouched. Setting the model directly would
therefore miss the event handling exercised by the first two tests.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestSignalForms/test.spec.ts&initialpath=%3Fspec%3DTestSignalForms)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestSignalForms/test.spec.ts&initialpath=%3Fspec%3DTestSignalForms)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/test.spec.ts"
import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

describe('TestSignalForms', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS),
  );

  it('shows validation after a touch without changing the value', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    expect(component.profile.name().invalid()).toBe(true);
    expect(component.profile.name().touched()).toBe(false);
    expect(component.profile.name().dirty()).toBe(false);
    expect(ngMocks.find('[role="alert"]', undefined)).toBeUndefined();
    expect(ngMocks.find<HTMLButtonElement>('button').nativeElement.disabled).toBe(true);

    // Blur exposes the validation message without making the field dirty.
    ngMocks.touch('input');
    fixture.detectChanges();

    expect(component.model()).toEqual({ name: '' });
    expect(component.profile.name().touched()).toBe(true);
    expect(component.profile.name().dirty()).toBe(false);
    expect(component.profile.name().errors().map(error => error.kind)).toEqual(['required']);
    expect(ngMocks.formatText(ngMocks.find('[role="alert"]'))).toBe('Name is required');
  });

  it('updates the model and clears rendered validation after an edit', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    ngMocks.touch('input');
    fixture.detectChanges();
    expect(ngMocks.formatText(ngMocks.find('[role="alert"]'))).toBe('Name is required');

    // change includes blur, so it also marks a native field touched.
    ngMocks.change('input', 'Ada');
    fixture.detectChanges();

    expect(component.model()).toEqual({ name: 'Ada' });
    expect(component.profile.name().value()).toBe('Ada');
    expect(component.profile.name().dirty()).toBe(true);
    expect(component.profile.name().touched()).toBe(true);
    expect(component.profile.name().errors()).toEqual([]);
    expect(ngMocks.find('[role="alert"]', undefined)).toBeUndefined();
    expect(ngMocks.find<HTMLButtonElement>('button').nativeElement.disabled).toBe(false);
  });

  it('renders a programmatic model update without simulating user interaction', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    component.model.set({ name: 'Grace' });
    fixture.detectChanges();

    expect(ngMocks.find<HTMLInputElement>('input').nativeElement.value).toBe('Grace');
    expect(component.profile.name().value()).toBe('Grace');
    expect(component.profile.name().dirty()).toBe(false);
    expect(component.profile.name().touched()).toBe(false);
    expect(ngMocks.find<HTMLButtonElement>('button').nativeElement.disabled).toBe(false);
    expect(ngMocks.find('[role="alert"]', undefined)).toBeUndefined();
  });
});
```

## Test a form with a mocked CVA child

A signal form can bind an existing `ControlValueAccessor` component through `[formField]`.
To test the parent form independently, mock that child and exercise the callbacks registered
by the real `FormField` directive.

Here the child is a name input. Its CVA API uses prototype methods so `ng-mocks` can
detect and wire the accessor when it creates the mock.
See [form control definitions](/extra/mock-form-controls.md#caution-about-controlvalueaccessor)
for why function-valued properties do not work for this API.

```ts
import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'name-control',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
  ],
  template: `
    <input
      [value]="value"
      (input)="onChange($any($event.target).value)"
      (blur)="onTouched()"
    />
  `,
})
class CvaComponent implements ControlValueAccessor {
  public value = '';
  public onChange: (value: string) => void = () => undefined;
  public onTouched: () => void = () => undefined;

  public writeValue(value: string): void {
    this.value = value;
  }

  public registerOnChange(callback: (value: string) => void): void {
    this.onChange = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }
}

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

Install the `writeValue` spy through `MockInstance` **before** `MockRender`, because
`FormField` writes the initial value during rendering. The first test checks that initial
write, a subsequent model update, and a change emitted by the mocked child.

The mock has no native input to type into. Pass its host element to `ngMocks.change`
to invoke the CVA change callback. This callback marks the field dirty; touching the
mock is a separate interaction, covered by the second test.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestSignalForms/cva.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Acva)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestSignalForms/cva.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Acva)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/cva.spec.ts"
import {
  MockBuilder,
  MockInstance,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

describe('TestSignalForms:cva', () => {
  MockInstance.scope();

  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(CvaComponent),
  );

  it('passes values between the signal model and the mocked CVA', () => {
    const writeValue = jasmine.createSpy('writeValue');
    // In Jest: const writeValue = jest.fn();

    MockInstance(CvaComponent, 'writeValue', writeValue);
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const child = ngMocks.find(CvaComponent);

    expect(writeValue).toHaveBeenCalledWith('Ada');

    component.model.set({ name: 'Grace' });
    fixture.detectChanges();

    expect(writeValue).toHaveBeenCalledWith('Grace');
    expect(component.f.name().dirty()).toBe(false);

    ngMocks.change(child, 'Katherine');

    expect(component.model()).toEqual({ name: 'Katherine' });
    expect(component.f.name().dirty()).toBe(true);
    expect(component.f.name().touched()).toBe(false);
  });

  it('marks the field touched without changing its value or dirty state', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const child = ngMocks.find(CvaComponent);

    expect(component.f.name().touched()).toBe(false);

    ngMocks.touch(child);

    expect(component.f.name().touched()).toBe(true);
    expect(component.f.name().dirty()).toBe(false);
    expect(component.model()).toEqual({ name: 'Ada' });
  });
});
```

## Test a form with a mocked signal control

A `FormValueControl` uses a `value` model to exchange values with `FormField`.
In Angular 22, its `touch` output reports blur, while its `touched` input receives
the resulting field state. Keep `FormField` real when mocking this child so the test
exercises both directions of those bindings.

```ts
import { Component, input, model, output, signal } from '@angular/core';
import { form, FormField, FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'signal-name-control',
  template: `
    <input
      [value]="value()"
      (input)="value.set($any($event.target).value)"
      (blur)="touch.emit()"
    />
  `,
})
class NameControl implements FormValueControl<string> {
  public readonly value = model('');
  public readonly touched = input(false);
  public readonly touch = output<void>();
}

@Component({
  selector: 'target-signal-forms-model',
  imports: [FormField, NameControl],
  template: `
    <signal-name-control [formField]="f.name" />
    <span class="name">{{ model().name }}</span>
  `,
})
class TargetComponent {
  public readonly model = signal({ name: 'Ada' });
  public readonly f = form(this.model);
}
```

Pass the mocked child's host element to `ngMocks.change` to update its model.
This marks the field dirty and updates the parent's rendered name. Touching the
control is a separate interaction: `ngMocks.touch` emits `touch`, and change detection
delivers the updated field state to the child's `touched` input.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestSignalForms/model.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Amodel)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestSignalForms/model.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Amodel)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/model.spec.ts"
import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

describe('TestSignalForms:model', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(NameControl),
  );

  it('updates the parent and rendered name through the mocked model', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const child = ngMocks.find(NameControl);
    const control = ngMocks.get(child, NameControl);

    expect(control.value()).toBe('Ada');

    // The mocked component still exposes the model output used by FormField.
    ngMocks.change(child, 'Grace');
    fixture.detectChanges();

    expect(component.model()).toEqual({ name: 'Grace' });
    expect(component.f.name().dirty()).toBe(true);
    expect(component.f.name().touched()).toBe(false);
    expect(control.value()).toBe('Grace');
    expect(control.touched()).toBe(false);
    expect(ngMocks.formatText(ngMocks.find('.name'))).toBe('Grace');
  });

  it('feeds touched state back into the mock without changing the name', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const child = ngMocks.find(NameControl);
    const control = ngMocks.get(child, NameControl);

    expect(control.touched()).toBe(false);

    // The touch output marks the field touched; its input receives that state.
    ngMocks.touch(child);
    fixture.detectChanges();

    expect(component.model()).toEqual({ name: 'Ada' });
    expect(component.f.name().dirty()).toBe(false);
    expect(component.f.name().touched()).toBe(true);
    expect(control.value()).toBe('Ada');
    expect(control.touched()).toBe(true);
    expect(ngMocks.formatText(ngMocks.find('.name'))).toBe('Ada');
  });
});
```

## Complete example specs

- [Native field selectors with real and mocked form bindings](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/selectors.spec.ts)
- [Custom control selectors with real and mocked children](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/selectors-model.spec.ts)
- [Native fields, validation, and model updates](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/test.spec.ts)
- [Signal form with a mocked CVA child](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/cva.spec.ts)
- [Signal form with a mocked model-based child](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/model.spec.ts)

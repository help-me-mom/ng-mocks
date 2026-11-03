---
title: How to test CVA validation with signal forms in Angular
description: Keep a CVA child's validator real, read signal form errors, and test recovery or controlled mock validation with ng-mocks
sidebar_label: Signal Forms CVA Validation
---

Keep a custom control real to test how its `validate` method affects a signal form.
Starting with Angular 22, `FormField` integrates synchronous validators registered
through `NG_VALIDATORS` on a `ControlValueAccessor`.

This child provides both the value accessor and validator. Its `validate` method
reads the supplied control's value and rejects `invalid` with `{ custom: true }`:

```ts
import { Component, forwardRef, signal } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'validated-name-control',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
  ],
  template: `
    <input
      [value]="value"
      (input)="value = $any($event.target).value; onChange(value)"
      (blur)="onTouched()"
    />
  `,
})
class CvaComponent implements ControlValueAccessor, Validator {
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

  public validate(control: AbstractControl): ValidationErrors | null {
    return control.value === 'invalid' ? { custom: true } : null;
  }
}

@Component({
  selector: 'target-signal-forms-cva-validator',
  imports: [FormField, CvaComponent],
  template: '<validated-name-control [formField]="f.name" />',
})
class TargetComponent {
  public readonly model = signal({ name: 'invalid' });
  public readonly f = form(this.model);
}
```

## Test setup

Configure the testing module in `beforeEach` with [`MockBuilder`](/api/MockBuilder.md).
Keep `FormField` and [`NG_MOCKS_ROOT_PROVIDERS`](/api/MockBuilder.md#ng_mocks_root_providers-token)
real so Angular connects the field and handles native input events.
Keep `CvaComponent` as well: keeping only `FormField` would still mock the imported child
and replace its validation rule.

```ts
beforeEach(() =>
  MockBuilder(TargetComponent)
    // Keep the field connection and root services used by input events.
    .keep(FormField)
    .keep(NG_MOCKS_ROOT_PROVIDERS)
    // Run the child's original CVA methods and validation rule.
    .keep(CvaComponent),
);
```

## Testing the validation rule

Inside `it`, render the component with [`MockRender`](/api/MockRender.md).
Use [`ngMocks.find`](/api/ngMocks/find.md) to inspect the child and its native input,
and [`ngMocks.get`](/api/ngMocks/get.md) to read the registered validator.
Angular converts each `ValidationErrors` key into an error's `kind`, so `{ custom: true }`
appears as `custom` in `f.name().errors()`.

Change the child's input with [`ngMocks.change`](/api/ngMocks/change.md). This exercises
the real input handler and CVA callback. Once `validate` returns `null`, both the field
and the form become valid:

```ts
// Render the component with its initially invalid value.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the child and its input to inspect the provider and displayed value.
const child = ngMocks.find(CvaComponent);
const control = ngMocks.get(child, CvaComponent);
const input = ngMocks.find<HTMLInputElement>(child, 'input');

// Read the registered validator, value, and validation state.
expect(ngMocks.get(child, NG_VALIDATORS)).toEqual([control]);
expect(control.value).toBe('invalid');
expect(input.nativeElement.value).toBe('invalid');
// Angular 22 converts each legacy ValidationErrors key to an error kind.
expect(component.f.name().errors().map(error => error.kind)).toEqual(['custom']);
expect(component.f.name().invalid()).toBe(true);
expect(component.f().invalid()).toBe(true);

// Exercise the retained child's input and registered CVA callback.
ngMocks.change('validated-name-control input', 'Ada');
// or ngMocks.change(input, 'Ada');
fixture.detectChanges();

// Assert that the model updated and the real validator cleared its error.
expect(component.model()).toEqual({ name: 'Ada' });
expect(control.value).toBe('Ada');
expect(input.nativeElement.value).toBe('Ada');
expect(component.f.name().errors()).toEqual([]);
expect(component.f.name().valid()).toBe(true);
expect(component.f().valid()).toBe(true);
```

## Mocking the child's validation

When the child's rule is outside the scope of the parent test, replace
`.keep(CvaComponent)` with `.mock(CvaComponent)` in the setup. The default mock does
not run the original rule, so the initial `invalid` value has no validation error:

```ts
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Mocking the child removes its original validation rule.
expect(component.model()).toEqual({ name: 'invalid' });
expect(component.f.name().errors()).toEqual([]);
expect(component.f().valid()).toBe(true);
```

To test the parent's response to a specific error, customize the mock's `validate`
method with [`MockInstance`](/api/MockInstance.md) before rendering.
Add `MockInstance.scope()` in the surrounding `describe` to restore customizations
between tests:

```ts
// Set the mock's result before Angular first runs validation.
MockInstance(CvaComponent, 'validate', () => ({ controlled: true }));
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Assert the parent's state without depending on the original rule.
expect(component.f.name().errors().map(error => error.kind)).toEqual(['controlled']);
expect(component.f().invalid()).toBe(true);
```

## Live example {#complete-example}

The complete example covers the retained validator, the default mock, and a mock
with a controlled validation result.

- [Source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/cva-validator.spec.ts)
- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestSignalForms/cva-validator.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Acva-validator)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestSignalForms/cva-validator.spec.ts&initialpath=%3Fspec%3DTestSignalForms%3Acva-validator)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestSignalForms/cva-validator.spec.ts"
import { Component, forwardRef, signal } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'validated-name-control',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
  ],
  template: `
    <input
      [value]="value"
      (input)="value = $any($event.target).value; onChange(value)"
      (blur)="onTouched()"
    />
  `,
})
class CvaComponent implements ControlValueAccessor, Validator {
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

  public validate(control: AbstractControl): ValidationErrors | null {
    return control.value === 'invalid' ? { custom: true } : null;
  }
}

@Component({
  selector: 'target-signal-forms-cva-validator',
  imports: [FormField, CvaComponent],
  template: '<validated-name-control [formField]="f.name" />',
})
class TargetComponent {
  public readonly model = signal({ name: 'invalid' });
  public readonly f = form(this.model);
}

describe('TestSignalForms:cva-validator', () => {
  // Restore validator customizations between tests.
  MockInstance.scope();

  describe('retained validator', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        // Keep the field connection and root services used by input events.
        .keep(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS)
        // Run the child's original CVA methods and validation rule.
        .keep(CvaComponent),
    );

    it('maps the real validator error to field state and clears it after an edit', () => {
      // Render the component with its initially invalid value.
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      // Find the child and its input to inspect the provider and displayed value.
      const child = ngMocks.find(CvaComponent);
      const control = ngMocks.get(child, CvaComponent);
      const input = ngMocks.find<HTMLInputElement>(child, 'input');

      // Read the registered validator, value, and validation state.
      expect(ngMocks.get(child, NG_VALIDATORS)).toEqual([control]);
      expect(control.value).toBe('invalid');
      expect(input.nativeElement.value).toBe('invalid');
      // Angular 22 converts each legacy ValidationErrors key to an error kind.
      expect(component.f.name().errors().map(error => error.kind)).toEqual(['custom']);
      expect(component.f.name().invalid()).toBe(true);
      expect(component.f().invalid()).toBe(true);

      // Exercise the retained child's input and registered CVA callback.
      ngMocks.change('validated-name-control input', 'Ada');
      // or ngMocks.change(input, 'Ada');
      fixture.detectChanges();

      // Assert that the model updated and the real validator cleared its error.
      expect(component.model()).toEqual({ name: 'Ada' });
      expect(control.value).toBe('Ada');
      expect(input.nativeElement.value).toBe('Ada');
      expect(component.f.name().errors()).toEqual([]);
      expect(component.f.name().valid()).toBe(true);
      expect(component.f().valid()).toBe(true);
    });
  });

  describe('mocked validator', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        // Keep Angular's field connection while replacing the child.
        .keep(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS)
        .mock(CvaComponent),
    );

    it('does not run the original validation rule on a mocked child', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      // Mocking the child removes its original validation rule.
      expect(component.model()).toEqual({ name: 'invalid' });
      expect(component.f.name().errors()).toEqual([]);
      expect(component.f().valid()).toBe(true);
    });

    it('uses a controlled validation result supplied before rendering', () => {
      // Set the mock's result before Angular first runs validation.
      MockInstance(CvaComponent, 'validate', () => ({ controlled: true }));
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      // Assert the parent's state without depending on the original rule.
      expect(component.f.name().errors().map(error => error.kind)).toEqual(['controlled']);
      expect(component.f().invalid()).toBe(true);
    });
  });
});
```

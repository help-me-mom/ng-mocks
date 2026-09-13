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

// @see https://github.com/help-me-mom/ng-mocks/issues/14986
describe('TestSignalForms:cva-validator', () => {
  MockInstance.scope();

  describe('retained validator', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .keep(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS)
        .keep(CvaComponent),
    );

    it('maps the real validator error to field state and clears it after an edit', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const child = ngMocks.find(CvaComponent);
      const control = ngMocks.get(child, CvaComponent);
      const input = ngMocks.find<HTMLInputElement>(child, 'input');

      expect(ngMocks.get(child, NG_VALIDATORS)).toEqual([control]);
      expect(control.value).toBe('invalid');
      expect(input.nativeElement.value).toBe('invalid');
      // Angular 22 converts each legacy ValidationErrors key to an error kind.
      expect(
        component.f
          .name()
          .errors()
          .map(error => error.kind),
      ).toEqual(['custom']);
      expect(component.f.name().invalid()).toBe(true);
      expect(component.f().invalid()).toBe(true);

      // Exercise the retained child's input and registered CVA callback.
      ngMocks.change(input, 'Ada');
      fixture.detectChanges();

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
        .keep(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS)
        .mock(CvaComponent),
    );

    it('does not run the original validation rule on a mocked child', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      expect(component.model()).toEqual({ name: 'invalid' });
      expect(component.f.name().errors()).toEqual([]);
      expect(component.f().valid()).toBe(true);
    });

    it('uses a controlled validation result supplied before rendering', () => {
      MockInstance(CvaComponent, 'validate', () => ({
        controlled: true,
      }));
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      expect(
        component.f
          .name()
          .errors()
          .map(error => error.kind),
      ).toEqual(['controlled']);
      expect(component.f().invalid()).toBe(true);
    });
  });
});

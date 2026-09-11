import { Component, forwardRef, signal } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
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

  // Declare CVA methods on the prototype so ng-mocks can discover them.
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

describe('TestSignalForms:cva', () => {
  // Reset the writeValue customization after each test.
  MockInstance.scope();

  beforeEach(() =>
    MockBuilder(TargetComponent)
      // Keep the real form binding while replacing the child control.
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(CvaComponent),
  );

  it('passes values between the signal model and the mocked CVA', () => {
    const writeValue =
      typeof jest === 'undefined'
        ? jasmine.createSpy('writeValue')
        : jest.fn();

    // FormField writes the initial value during rendering.
    MockInstance(CvaComponent, 'writeValue', writeValue);
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const child = ngMocks.find(CvaComponent);

    expect(writeValue).toHaveBeenCalledWith('Ada');

    // A model update reaches the CVA on the next change-detection pass.
    component.model.set({ name: 'Grace' });
    fixture.detectChanges();

    expect(writeValue).toHaveBeenCalledWith('Grace');
    expect(component.f.name().dirty()).toBe(false);

    // The mock has no input to type into; simulate its registered CVA callback.
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

    // Touch the mock through the callback registered by FormField.
    ngMocks.touch(child);

    expect(component.f.name().touched()).toBe(true);
    expect(component.f.name().dirty()).toBe(false);
    expect(component.model()).toEqual({ name: 'Ada' });
  });
});

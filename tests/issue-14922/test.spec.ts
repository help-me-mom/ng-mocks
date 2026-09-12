import { Component, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'standalone-cva',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: '<input [formControl]="control" />',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneCVAComponent),
      multi: true,
    },
  ],
})
class StandaloneCVAComponent implements ControlValueAccessor {
  public readonly control = new FormControl('');

  public registerOnChange(
    callback: (value: string | null) => void,
  ): void {
    this.control.valueChanges.subscribe(callback);
  }

  public registerOnTouched(): void {}

  public setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }

  public writeValue(value: string | null): void {
    this.control.setValue(value, { emitEvent: false });
  }
}

@Component({
  selector: 'target',
  standalone: true,
  imports: [ReactiveFormsModule, StandaloneCVAComponent],
  template: `
    <ng-container [formGroup]="form">
      <standalone-cva formControlName="nestedForm"></standalone-cva>
    </ng-container>
  `,
})
class TargetComponent {
  public readonly form = new FormGroup({
    nestedForm: new FormControl('http://example.com'),
  });
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14922
describe('issue-14922', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(StandaloneCVAComponent)
      .keep(ReactiveFormsModule),
  );

  it('preserves the real accessor self alias and its inner reactive control', () => {
    const fixture = MockRender(TargetComponent);
    const parent =
      fixture.point.componentInstance.form.controls.nestedForm;
    const element = ngMocks.find(StandaloneCVAComponent);
    const accessor = element.componentInstance;
    const accessors = element.injector.get(NG_VALUE_ACCESSOR);
    const inputElement = ngMocks.find(element, 'input');
    const input: HTMLInputElement = inputElement.nativeElement;

    expect(isMockOf(accessor, StandaloneCVAComponent)).toBe(false);
    expect(accessor.constructor).toBe(StandaloneCVAComponent);
    expect(accessors.length).toBe(1);
    expect(accessors[0]).toBe(accessor);
    expect(accessor.control.value).toBe('http://example.com');
    expect(input.value).toBe('http://example.com');
    expect(accessor.control.enabled).toBe(true);
    expect(input.disabled).toBe(false);

    const values: Array<string | null> = [];
    const subscription = parent.valueChanges.subscribe(value =>
      values.push(value),
    );
    ngMocks.change(inputElement, 'inner');
    fixture.detectChanges();
    subscription.unsubscribe();

    expect(parent.value).toBe('inner');
    expect(accessor.control.value).toBe('inner');
    expect(input.value).toBe('inner');
    expect(values).toEqual(['inner']);

    parent.setValue('parent');
    fixture.detectChanges();

    expect(accessor.control.value).toBe('parent');
    expect(input.value).toBe('parent');

    parent.disable();
    fixture.detectChanges();

    expect(parent.disabled).toBe(true);
    expect(accessor.control.disabled).toBe(true);
    expect(input.disabled).toBe(true);

    parent.enable();
    fixture.detectChanges();

    expect(parent.enabled).toBe(true);
    expect(accessor.control.enabled).toBe(true);
    expect(input.disabled).toBe(false);
    expect(parent.value).toBe('parent');
    expect(accessor.control.value).toBe('parent');
    expect(input.value).toBe('parent');
    expect(element.injector.get(NG_VALUE_ACCESSOR)[0]).toBe(accessor);
  });
});

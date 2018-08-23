import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomFormControlComponent),
    }
  ],
  selector: 'custom-form-control',
  template: `
    <span>{{value}}</span>
    <button (click)="this.onChange('changed')">Change value</button>
  `,
})
export class CustomFormControlComponent implements ControlValueAccessor {

  @Input() disabled = false;
  public value = '';

  onChange = (value: string) => {};
  onTouched = () => {};

  registerOnChange(fn: (rating: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: string): void {
    this.value = value;
  }
}

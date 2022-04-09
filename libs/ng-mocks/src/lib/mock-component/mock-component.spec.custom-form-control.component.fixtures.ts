import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomFormControlComponent),
    },
  ],
  selector: 'custom-form-control',
  template: `
    <span>{{ value }}</span>
    <button (click)="this.onChange('changed')">Change value</button>
  `,
})
export class CustomFormControlComponent implements ControlValueAccessor {
  @Input() public disabled = false;
  public value = '';

  protected change: any;

  public onChange = (value: string): void => {
    this.change = value;
  };

  public onTouched = (): void => undefined;

  public registerOnChange(fn: (rating: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public writeValue(value: string): void {
    this.value = value;
  }
}

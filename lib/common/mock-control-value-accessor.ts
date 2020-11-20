// tslint:disable:variable-name

import { AbstractControl, ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';

import { Mock } from './mock';

export class MockControlValueAccessor extends Mock implements ControlValueAccessor, Validator {
  public readonly __ngMocksMockControlValueAccessor: true = true;

  /* istanbul ignore next */
  public __simulateChange = (value: any) => {};

  /* istanbul ignore next */
  public __simulateTouch = () => {};

  /* istanbul ignore next */
  public __simulateValidatorChange = () => {};

  public registerOnChange(fn: (value: any) => void): void {
    this.__simulateChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.__simulateTouch = fn;
  }

  public registerOnValidatorChange(fn: () => void): void {
    this.__simulateValidatorChange = fn;
  }

  public setDisabledState(isDisabled: boolean): void {}

  public validate(control: AbstractControl): ValidationErrors | null {
    return null;
  }

  public writeValue(value: any) {}
}

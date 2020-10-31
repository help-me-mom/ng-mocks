// tslint:disable:variable-name

import { AbstractControl, ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';

import { Mock } from './mock';

export class MockControlValueAccessor extends Mock implements ControlValueAccessor, Validator {
  public readonly __ngMocksMockControlValueAccessor: true = true;

  /* istanbul ignore next */
  __simulateChange = (value: any) => {};

  /* istanbul ignore next */
  __simulateTouch = () => {};

  /* istanbul ignore next */
  __simulateValidatorChange = () => {};

  registerOnChange(fn: (value: any) => void): void {
    this.__simulateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.__simulateTouch = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.__simulateValidatorChange = fn;
  }

  setDisabledState = (isDisabled: boolean): void => {};

  validate = (control: AbstractControl): ValidationErrors | null => null;

  writeValue = (value: any) => {};
}

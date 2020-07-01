import { EventEmitter } from '@angular/core';
import { AbstractControl, ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';

import { mockServiceHelper } from '../mock-service';

// tslint:disable-next-line:no-unnecessary-class
export class Mock {
  // tslint:disable-next-line:variable-name
  public readonly __ngMocksMock: true = true;

  constructor() {
    // setting outputs
    for (const output of (this as any).__mockedOutputs) {
      if ((this as any)[output] || Object.getOwnPropertyDescriptor(this, output)) {
        continue;
      }
      (this as any)[output] = new EventEmitter<any>();
    }

    // setting our mocked methods and props
    const prototype = Object.getPrototypeOf(this);
    for (const method of mockServiceHelper.extractMethodsFromPrototype(prototype)) {
      const descriptor = mockServiceHelper.extractPropertyDescriptor(prototype, method);
      if (descriptor) {
        Object.defineProperty(this, method, descriptor);
      }
    }
    for (const prop of mockServiceHelper.extractPropertiesFromPrototype(prototype)) {
      const descriptor = mockServiceHelper.extractPropertyDescriptor(prototype, prop);
      if (!descriptor) {
        continue;
      }
      Object.defineProperty(this, prop, descriptor);
    }

    // setting mocks for original class methods and props
    for (const method of mockServiceHelper.extractMethodsFromPrototype((this.constructor as any).mockOf.prototype)) {
      if ((this as any)[method] || Object.getOwnPropertyDescriptor(this, method)) {
        continue;
      }
      mockServiceHelper.mock(this, method);
    }
    for (const prop of mockServiceHelper.extractPropertiesFromPrototype((this.constructor as any).mockOf.prototype)) {
      if ((this as any)[prop] || Object.getOwnPropertyDescriptor(this, prop)) {
        continue;
      }
      mockServiceHelper.mock(this, prop, 'get');
      mockServiceHelper.mock(this, prop, 'set');
    }

    // and faking prototype
    Object.setPrototypeOf(this, (this.constructor as any).mockOf.prototype);
  }
}

export class MockControlValueAccessor extends Mock implements ControlValueAccessor, Validator {
  // tslint:disable-next-line:variable-name
  public readonly __ngMocksMockControlValueAccessor: true = true;

  __simulateChange = (value: any) => {}; // tslint:disable-line:variable-name

  __simulateTouch = () => {}; // tslint:disable-line:variable-name

  __simulateValidatorChange = () => {}; // tslint:disable-line:variable-name

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

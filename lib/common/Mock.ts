import { EventEmitter, Injector, Optional } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl, ValidationErrors, Validator } from '@angular/forms';

import { mockServiceHelper } from '../mock-service';

import { ngMocksUniverse } from './ng-mocks-universe';

// tslint:disable-next-line:interface-over-type-literal
export type ngMocksMockConfig = {
  outputs?: string[];
  setNgValueAccessor?: boolean;
};

// tslint:disable-next-line:no-unnecessary-class
export class Mock {
  // tslint:disable-next-line:variable-name
  public readonly __ngMocksMock: true = true;

  // tslint:disable-next-line:variable-name
  protected readonly __ngMocksConfig?: ngMocksMockConfig;

  constructor(@Optional() injector?: Injector) {
    const mockOf = (this.constructor as any).mockOf;

    if (injector && this.__ngMocksConfig && this.__ngMocksConfig.setNgValueAccessor) {
      try {
        // tslint:disable-next-line:no-bitwise
        const ngControl = (injector.get as any)(/* A5 */ NgControl, undefined, 0b1010);
        if (ngControl && !ngControl.valueAccessor) {
          ngControl.valueAccessor = this;
        }
      } catch (e) {
        // nothing to do.
      }
    }

    // setting outputs

    const mockedOutputs = [];
    for (const output of this.__ngMocksConfig && this.__ngMocksConfig.outputs ? this.__ngMocksConfig.outputs : []) {
      mockedOutputs.push(output.split(':')[0]);
    }

    for (const output of mockedOutputs) {
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
    for (const method of mockServiceHelper.extractMethodsFromPrototype(mockOf.prototype)) {
      if ((this as any)[method] || Object.getOwnPropertyDescriptor(this, method)) {
        continue;
      }
      mockServiceHelper.mock(this, method);
    }
    for (const prop of mockServiceHelper.extractPropertiesFromPrototype(mockOf.prototype)) {
      if ((this as any)[prop] || Object.getOwnPropertyDescriptor(this, prop)) {
        continue;
      }
      mockServiceHelper.mock(this, prop, 'get');
      mockServiceHelper.mock(this, prop, 'set');
    }

    // and faking prototype
    Object.setPrototypeOf(this, mockOf.prototype);

    const config = ngMocksUniverse.config.get(mockOf);
    if (config && config.init && config.init) {
      config.init(this, injector);
    }
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

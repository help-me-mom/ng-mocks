// tslint:disable: no-bitwise variable-name interface-over-type-literal

import { EventEmitter, Injector, Optional } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl, ValidationErrors, Validator } from '@angular/forms';

import { mockServiceHelper } from '../mock-service';

import { ngMocksUniverse } from './ng-mocks-universe';

export type ngMocksMockConfig = {
  outputs?: string[];
  setNgValueAccessor?: boolean;
};

export class Mock {
  public readonly __ngMocksMock: true = true;

  protected readonly __ngMocksConfig?: ngMocksMockConfig;

  constructor(@Optional() injector?: Injector) {
    const mockOf = (this.constructor as any).mockOf;

    if (injector && this.__ngMocksConfig && this.__ngMocksConfig.setNgValueAccessor) {
      try {
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
      /* istanbul ignore next */
      if (!descriptor) {
        continue;
      }
      Object.defineProperty(this, method, descriptor);
    }
    for (const prop of mockServiceHelper.extractPropertiesFromPrototype(prototype)) {
      const descriptor = mockServiceHelper.extractPropertyDescriptor(prototype, prop);
      /* istanbul ignore next */
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

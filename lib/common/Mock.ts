// tslint:disable:max-classes-per-file

import { EventEmitter } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { mockServiceHelper } from '../mock-service';

// tslint:disable-next-line:no-unnecessary-class
export class Mock {
  constructor() {
    (this as any).__ngMocks = true;

    // first setting our mocked methods and properties
    for (const method of mockServiceHelper.extractMethodsFromPrototype(Object.getPrototypeOf(this))) {
      (this as any)[method] = (this as any)[method];
    }
    for (const property of mockServiceHelper.extractPropertiesFromPrototype(Object.getPrototypeOf(this))) {
      const value = Object.getOwnPropertyDescriptor(this, property);
      if (!value) {
        continue;
      }
      Object.defineProperty(this, property, value);
    }

    // then setting mocks for original class methods and properties
    for (const method of mockServiceHelper.extractMethodsFromPrototype((this.constructor as any).mockOf.prototype)) {
      if ((this as any)[method]) {
        continue;
      }
      mockServiceHelper.mock(this, method);
    }
    for (const output of (this as any).__mockedOutputs) {
      if ((this as any)[output]) {
        continue;
      }
      (this as any)[output] = new EventEmitter<any>();
    }
    for (const prop of mockServiceHelper.extractPropertiesFromPrototype((this.constructor as any).mockOf.prototype)) {
      mockServiceHelper.mock(this, prop, 'get');
      mockServiceHelper.mock(this, prop, 'set');
    }

    // and faking prototype
    Object.setPrototypeOf(this, (this.constructor as any).mockOf.prototype);
  }
}

export class MockControlValueAccessor extends Mock implements ControlValueAccessor {
  __simulateChange = (param: any) => {}; // tslint:disable-line:variable-name

  __simulateTouch = () => {}; // tslint:disable-line:variable-name

  registerOnChange(fn: (value: any) => void): void {
    this.__simulateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.__simulateTouch = fn;
  }

  writeValue = () => {};
}

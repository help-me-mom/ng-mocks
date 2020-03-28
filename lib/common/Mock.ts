// tslint:disable:max-classes-per-file

import { EventEmitter } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { mockServiceHelper } from '../mock-service';

// tslint:disable-next-line:no-unnecessary-class
export class Mock {
  constructor() {
    for (const method of (this as any).__mockedMethods) {
      if ((this as any)[method]) {
        continue;
      }
      (this as any)[method] = mockServiceHelper.mockFunction(this, method);
    }
    for (const output of (this as any).__mockedOutputs) {
      if ((this as any)[output]) {
        continue;
      }
      (this as any)[output] = new EventEmitter<any>();
    }
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

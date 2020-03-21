import { EventEmitter } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export class Mock implements ControlValueAccessor {
  constructor() {
    for (const method of (this as any).__mockedMethods) {
      if ((this as any)[method]) {
        continue;
      }
      (this as any)[method] = () => undefined;
    }
    for (const output of (this as any).__mockedOutputs) {
      if ((this as any)[output]) {
        continue;
      }
      (this as any)[output] = new EventEmitter<any>();
    }
  }

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

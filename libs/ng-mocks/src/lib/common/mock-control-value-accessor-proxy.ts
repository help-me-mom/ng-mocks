import { AsyncValidator, ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';

import { AnyType } from './core.types';
import { MockControlValueAccessor, MockValidator } from './mock-control-value-accessor';

const applyProxy = (proxy: any, method: string, value: any, storage?: string) => {
  if (proxy.instance && storage) {
    proxy.instance[storage] = value;
  }
  if (proxy.instance && proxy.instance[method]) {
    return proxy.instance[method](value);
  }
};

export class MockControlValueAccessorProxy implements ControlValueAccessor {
  public instance?: Partial<MockControlValueAccessor & ControlValueAccessor>;

  public constructor(public readonly target?: AnyType<any>) {}

  public registerOnChange(fn: any): void {
    applyProxy(this, 'registerOnChange', fn, '__simulateChange');
  }

  public registerOnTouched(fn: any): void {
    applyProxy(this, 'registerOnTouched', fn, '__simulateTouch');
  }

  public setDisabledState(isDisabled: boolean): void {
    applyProxy(this, 'setDisabledState', isDisabled);
  }

  public writeValue(value: any): void {
    applyProxy(this, 'writeValue', value);
  }
}

export class MockValidatorProxy implements Validator {
  public instance?: Partial<MockValidator & Validator>;

  public constructor(public readonly target?: AnyType<any>) {}

  public registerOnValidatorChange(fn: any): void {
    applyProxy(this, 'registerOnValidatorChange', fn, '__simulateValidatorChange');
  }

  public validate(control: any): ValidationErrors | null {
    if (this.instance && this.instance.validate) {
      return this.instance.validate(control);
    }

    return null;
  }
}

export class MockAsyncValidatorProxy implements AsyncValidator {
  public instance?: Partial<MockValidator & AsyncValidator>;

  public constructor(public readonly target?: AnyType<any>) {}

  public registerOnValidatorChange(fn: any): void {
    applyProxy(this, 'registerOnValidatorChange', fn, '__simulateValidatorChange');
  }

  public validate(control: any): any {
    if (this.instance && this.instance.validate) {
      const result: any = this.instance.validate(control);

      return result === undefined ? Promise.resolve(null) : result;
    }

    return Promise.resolve(null);
  }
}

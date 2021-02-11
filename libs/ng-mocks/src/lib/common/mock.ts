// tslint:disable variable-name

import { EventEmitter, Injector, Optional } from '@angular/core';

import { IMockBuilderConfig } from '../mock-builder/types';
import mockHelperStub from '../mock-helper/mock-helper.stub';
import mockInstanceApply from '../mock-instance/mock-instance-apply';
import helperMockService from '../mock-service/helper.mock-service';

import coreDefineProperty from './core.define-property';
import { mapValues } from './core.helpers';
import { AnyType } from './core.types';
import funcIsMock from './func.is-mock';
import { MockControlValueAccessorProxy } from './mock-control-value-accessor-proxy';
import ngMocksUniverse from './ng-mocks-universe';

let FormControlDirective: any | undefined;
let NgControl: any | undefined;
try {
  // tslint:disable-next-line no-require-imports no-var-requires
  const module = require('@angular/forms');
  // istanbul ignore else
  if (module) {
    FormControlDirective = module.FormControlDirective;
    NgControl = module.NgControl;
  }
} catch (e) {
  // nothing to do;
}

const setValueAccessor = (instance: MockConfig, injector?: Injector) => {
  if (injector && instance.__ngMocksConfig && instance.__ngMocksConfig.setControlValueAccessor) {
    try {
      const ngControl = (injector.get as any)(/* A5 */ NgControl, undefined, 0b1010);
      if (ngControl && !ngControl.valueAccessor) {
        ngControl.valueAccessor = new MockControlValueAccessorProxy(instance.constructor);
      }
    } catch (e) {
      // nothing to do.
    }
  }
};

// any because of optional @angular/forms
const getRelatedNgControl = (injector: Injector): any => {
  try {
    return (injector.get as any)(/* A5 */ NgControl, undefined, 0b1010);
  } catch (e) {
    return (injector.get as any)(/* A5 */ FormControlDirective, undefined, 0b1010);
  }
};

// connecting to NG_VALUE_ACCESSOR
const installValueAccessor = (ngControl: any, instance: any) => {
  if (!ngControl.valueAccessor.instance && ngControl.valueAccessor.target === instance.constructor) {
    ngControl.valueAccessor.instance = instance;
    helperMockService.mock(instance, 'registerOnChange');
    helperMockService.mock(instance, 'registerOnTouched');
    helperMockService.mock(instance, 'setDisabledState');
    helperMockService.mock(instance, 'writeValue');
    instance.__ngMocksConfig.isControlValueAccessor = true;
  }
};

// connecting to NG_VALIDATORS
// connecting to NG_ASYNC_VALIDATORS
const installValidator = (validators: any[], instance: any) => {
  for (const validator of validators) {
    if (!validator.instance && validator.target === instance.constructor) {
      validator.instance = instance;
      helperMockService.mock(instance, 'registerOnValidatorChange');
      helperMockService.mock(instance, 'validate');
      instance.__ngMocksConfig.isValidator = true;
    }
  }
};

const applyNgValueAccessor = (instance: any, injector?: Injector) => {
  setValueAccessor(instance, injector);

  if (injector) {
    try {
      const ngControl: any = getRelatedNgControl(injector);
      // istanbul ignore else
      if (ngControl) {
        installValueAccessor(ngControl, instance);
        installValidator(ngControl._rawValidators, instance);
        installValidator(ngControl._rawAsyncValidators, instance);
      }
    } catch (e) {
      // nothing to do.
    }
  }
};

const applyOutputs = (instance: MockConfig & Record<keyof any, any>) => {
  const mockOutputs = [];
  for (const output of instance.__ngMocksConfig.outputs || []) {
    mockOutputs.push(output.split(':')[0]);
  }

  for (const output of mockOutputs) {
    if (instance[output] || Object.getOwnPropertyDescriptor(instance, output)) {
      continue;
    }
    instance[output] = new EventEmitter<any>();
  }
};

const applyPrototype = (instance: Mock, prototype: AnyType<any>) => {
  for (const prop of [
    ...helperMockService.extractMethodsFromPrototype(prototype),
    ...helperMockService.extractPropertiesFromPrototype(prototype),
  ]) {
    const descriptor = helperMockService.extractPropertyDescriptor(prototype, prop);
    // istanbul ignore next
    if (!descriptor) {
      continue;
    }
    descriptor.configurable = true;
    Object.defineProperty(instance, prop, descriptor);
  }
};

const applyMethods = (instance: Mock & Record<keyof any, any>, prototype: AnyType<any>) => {
  for (const method of helperMockService.extractMethodsFromPrototype(prototype)) {
    if (instance[method] || Object.getOwnPropertyDescriptor(instance, method)) {
      continue;
    }
    helperMockService.mock(instance, method);
  }
};

const applyProps = (instance: Mock & Record<keyof any, any>, prototype: AnyType<any>) => {
  for (const prop of helperMockService.extractPropertiesFromPrototype(prototype)) {
    if (instance[prop] || Object.getOwnPropertyDescriptor(instance, prop)) {
      continue;
    }
    helperMockService.mock(instance, prop, 'get');
    helperMockService.mock(instance, prop, 'set');
  }
};

export type ngMocksMockConfig = {
  config?: IMockBuilderConfig;
  init?: (instance: any) => void;
  isControlValueAccessor?: boolean;
  isValidator?: boolean;
  outputs?: string[];
  setControlValueAccessor?: boolean;
};

const applyOverrides = (instance: any, mockOf: any, injector?: Injector): void => {
  const configGlobal: Set<any> | undefined = ngMocksUniverse.getOverrides().get(mockOf);
  const callbacks = configGlobal ? mapValues(configGlobal) : [];
  if (instance.__ngMocksConfig.init) {
    callbacks.push(instance.__ngMocksConfig.init);
  }
  callbacks.push(...mockInstanceApply(mockOf));

  for (const callback of callbacks) {
    const overrides = callback(instance, injector);
    if (!overrides) {
      continue;
    }
    mockHelperStub(instance, overrides);
  }
};

export interface MockConfig {
  __ngMocksConfig: ngMocksMockConfig;
}

export class Mock {
  protected __ngMocksConfig!: ngMocksMockConfig;

  public constructor(injector?: Injector) {
    const mockOf = (this.constructor as any).mockOf;
    coreDefineProperty(this, '__ngMocksInjector', injector);

    // istanbul ignore else
    if (funcIsMock(this)) {
      applyNgValueAccessor(this, injector);
      applyOutputs(this);
      applyPrototype(this, Object.getPrototypeOf(this));
      applyMethods(this, mockOf.prototype);
      applyProps(this, mockOf.prototype);
    }

    // and faking prototype
    Object.setPrototypeOf(this, mockOf.prototype);

    applyOverrides(this, mockOf, injector);
  }
}

coreDefineProperty(Mock, 'parameters', [[Injector, new Optional()]]);

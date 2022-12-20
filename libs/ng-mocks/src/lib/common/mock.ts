import { EventEmitter, Injector, Optional, PipeTransform, Self } from '@angular/core';

import { IMockBuilderConfig } from '../mock-builder/types';
import mockHelperStub from '../mock-helper/mock-helper.stub';
import mockInstanceApply from '../mock-instance/mock-instance-apply';
import helperMockService from '../mock-service/helper.mock-service';

import coreDefineProperty from './core.define-property';
import coreForm from './core.form';
import { mapValues } from './core.helpers';
import { AnyType } from './core.types';
import funcIsMock from './func.is-mock';
import { MockControlValueAccessorProxy } from './mock-control-value-accessor-proxy';
import ngMocksUniverse from './ng-mocks-universe';

const setValueAccessor = (instance: any, ngControl?: any) => {
  if (ngControl && !ngControl.valueAccessor && instance.__ngMocksConfig.setControlValueAccessor) {
    try {
      ngControl.valueAccessor = new MockControlValueAccessorProxy(instance.__ngMocksCtor);
    } catch {
      // nothing to do.
    }
  }
};

// connecting to NG_VALUE_ACCESSOR
const installValueAccessor = (ngControl: any, instance: any) => {
  if (!ngControl.valueAccessor.instance && ngControl.valueAccessor.target === instance.__ngMocksCtor) {
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
    if (!validator.instance && validator.target === instance.__ngMocksCtor) {
      validator.instance = instance;
      helperMockService.mock(instance, 'registerOnValidatorChange');
      helperMockService.mock(instance, 'validate');
      instance.__ngMocksConfig.isValidator = true;
    }
  }
};

const applyNgValueAccessor = (instance: any, ngControl: any) => {
  setValueAccessor(instance, ngControl);

  try {
    // istanbul ignore else
    if (ngControl) {
      installValueAccessor(ngControl, instance);
      installValidator(ngControl._rawValidators, instance);
      installValidator(ngControl._rawAsyncValidators, instance);
    }
  } catch {
    // nothing to do.
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
    helperMockService.definePropertyDescriptor(instance, prop, descriptor);
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
  hostBindings?: string[];
  hostListeners?: string[];
  init?: (instance: any) => void;
  isControlValueAccessor?: boolean;
  isValidator?: boolean;
  outputs?: string[];
  queryScanKeys?: string[];
  setControlValueAccessor?: boolean;
  transform?: PipeTransform['transform'];
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

/**
 * Mock class is the base class for each mock.
 * Usually, it should not be used directly.
 */
export class Mock {
  protected __ngMocksConfig!: ngMocksMockConfig;

  public constructor(
    injector: Injector | null = null,
    ngControl: any | null = null, // NgControl
  ) {
    const mockOf = (this.constructor as any).mockOf;
    coreDefineProperty(this, '__ngMocks', true);
    coreDefineProperty(this, '__ngMocksInjector', injector);
    coreDefineProperty(this, '__ngMocksCtor', this.constructor);
    for (const key of this.__ngMocksConfig.queryScanKeys || /* istanbul ignore next */ []) {
      coreDefineProperty(this, `__ngMocksVcr_${key}`, undefined);
    }
    for (const key of this.__ngMocksConfig.hostBindings || /* istanbul ignore next */ []) {
      helperMockService.mock(this, key, 'get');
      helperMockService.mock(this, key, 'set');
    }
    for (const key of this.__ngMocksConfig.hostListeners || /* istanbul ignore next */ []) {
      helperMockService.mock(this, key);
    }

    // istanbul ignore else
    if (funcIsMock(this)) {
      applyNgValueAccessor(this, ngControl);
      applyOutputs(this);
      applyPrototype(this, Object.getPrototypeOf(this));
      applyMethods(this, mockOf.prototype);
      applyProps(this, mockOf.prototype);
    }

    // and faking prototype
    Object.setPrototypeOf(this, mockOf.prototype);

    applyOverrides(this, mockOf, injector ?? undefined);
  }
}

coreDefineProperty(Mock, 'parameters', [
  [Injector, new Optional()],
  [coreForm.NgControl || /* istanbul ignore next */ (() => undefined), new Optional(), new Self()],
]);

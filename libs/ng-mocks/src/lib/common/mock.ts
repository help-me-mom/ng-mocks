import { EventEmitter, Injector, Optional, PipeTransform, Self } from '@angular/core';
import * as angularCore from '@angular/core';

import { IMockBuilderConfig } from '../mock-builder/types';
import mockHelperStub from '../mock-helper/mock-helper.stub';
import mockInstanceApply from '../mock-instance/mock-instance-apply';
import { rememberMockInstance } from '../mock-instance/mock-instance-tracker';
import helperMockService from '../mock-service/helper.mock-service';

import coreDefineProperty from './core.define-property';
import coreForm from './core.form';
import { AnyType, DirectiveIo } from './core.types';
import funcDirectiveIoParse from './func.directive-io-parse';
import funcIsMock from './func.is-mock';
import { MockControlValueAccessorProxy } from './mock-control-value-accessor-proxy';
import { resolveMockDeclaration } from './ng-mocks-injected-declarations';
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

const normalizeProxies = (value: any): any[] => (Array.isArray(value) ? value : value ? [value] : []);

const extractInjectableProxies = (injector: Injector | null | undefined, token: any): any[] => {
  if (!injector || !token) {
    return [];
  }

  try {
    return normalizeProxies(injector.get(token, []));
  } catch {
    return [];
  }
};

const extractUniqueProxies = (proxies: any[]): any[] => {
  const result: any[] = [];
  const known = new Set<any>();

  for (const proxy of proxies) {
    if (!proxy || known.has(proxy)) {
      continue;
    }
    known.add(proxy);
    result.push(proxy);
  }

  return result;
};

// Angular forms expose lazy CVA and validator proxies in different places across
// versions, so collect both NgControl internals and injectable multi-token values.
const extractValueAccessors = (ngControl: any, injector: Injector | null | undefined): any[] =>
  extractUniqueProxies([
    ...normalizeProxies(ngControl?.valueAccessor),
    ...normalizeProxies(ngControl?.rawValueAccessors),
    ...extractInjectableProxies(injector, coreForm.NG_VALUE_ACCESSOR),
  ]);

const extractValidators = (
  ngControl: any,
  injector: Injector | null | undefined,
  property: string,
  token: any,
): any[] =>
  extractUniqueProxies([...normalizeProxies(ngControl?.[property]), ...extractInjectableProxies(injector, token)]);

// connecting to NG_VALUE_ACCESSOR
const installValueAccessor = (ngControl: any, instance: any, injector?: Injector | null) => {
  for (const valueAccessor of extractValueAccessors(ngControl, injector)) {
    if (valueAccessor.instance || valueAccessor.target !== instance.__ngMocksCtor) {
      continue;
    }
    valueAccessor.instance = instance;
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

const applyNgValueAccessor = (instance: any, ngControl: any, injector?: Injector | null) => {
  setValueAccessor(instance, ngControl);

  try {
    if (ngControl || injector) {
      installValueAccessor(ngControl, instance, injector);
      installValidator(extractValidators(ngControl, injector, '_rawValidators', coreForm.NG_VALIDATORS), instance);
      installValidator(
        extractValidators(ngControl, injector, '_rawAsyncValidators', coreForm.NG_ASYNC_VALIDATORS),
        instance,
      );
    }
  } catch {
    // nothing to do.
  }
};

const applyOutputs = (instance: MockConfig & Record<keyof any, any>) => {
  const mockOutputs = [];
  for (const output of instance.__ngMocksConfig.outputs || []) {
    mockOutputs.push(funcDirectiveIoParse(output).name);
  }

  for (const output of mockOutputs) {
    if (instance[output] || Object.getOwnPropertyDescriptor(instance, output)) {
      continue;
    }
    instance[output] = new EventEmitter<any>();
  }
};

const applyInputs = (instance: MockConfig & Record<keyof any, any>) => {
  const inputFactory = (angularCore as any).input;
  // Older Angular versions do not expose the signal input factory.
  /* istanbul ignore if */
  if (typeof inputFactory !== 'function') {
    return;
  }

  for (const input of instance.__ngMocksConfig.inputs || []) {
    const { name, required, isSignal, transform } = funcDirectiveIoParse(input);
    if (!isSignal || Object.getOwnPropertyDescriptor(instance, name)) {
      continue;
    }

    const options = transform === undefined ? undefined : { transform };
    instance[name] =
      required && typeof inputFactory.required === 'function'
        ? inputFactory.required(options)
        : inputFactory(undefined, options);
  }
};

const applyPrototype = (instance: Mock, prototype: AnyType<any>) => {
  const properties: string[] = [];
  const methods = helperMockService.extractMethodsFromPrototype(prototype, properties);
  for (const prop of [...methods, ...properties]) {
    const descriptor = helperMockService.extractPropertyDescriptor(prototype, prop);
    helperMockService.definePropertyDescriptor(instance, prop, descriptor);
  }
};

const applyMethods = (instance: Mock & Record<keyof any, any>, methods: string[]) => {
  for (const method of methods) {
    if (instance[method] || Object.getOwnPropertyDescriptor(instance, method)) {
      continue;
    }
    helperMockService.mock(instance, method);
  }
};

const applyProps = (instance: Mock & Record<keyof any, any>, properties: string[]) => {
  for (const prop of properties) {
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
  inputs?: Array<DirectiveIo>;
  outputs?: Array<DirectiveIo>;
  queryScanKeys?: string[];
  setControlValueAccessor?: boolean;
  transform?: PipeTransform['transform'];
};

const applyOverrides = (instance: any, mockOf: any, injector?: Injector): void => {
  const configGlobal: Set<any> | undefined = ngMocksUniverse.getOverrides().get(mockOf);
  const callbacks = configGlobal ? [...configGlobal] : [];
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
      applyNgValueAccessor(this, ngControl, injector);
      applyInputs(this);
      applyOutputs(this);
      applyPrototype(this, Object.getPrototypeOf(this));
      const properties: string[] = [];
      const methods = helperMockService.extractMethodsFromPrototype(mockOf.prototype, properties);
      applyMethods(this, methods);
      applyProps(this, properties);
    }

    // and faking prototype
    Object.setPrototypeOf(this, mockOf.prototype);

    applyOverrides(this, mockOf, injector ?? undefined);
    // Declaration providers are created lazily by Angular during render. Register the fully prepared
    // mock instance here so a previous TestBed.inject seed can replay its overrides onto it.
    resolveMockDeclaration(mockOf, this);
    rememberMockInstance(mockOf, this, injector ?? undefined);
  }
}

coreDefineProperty(Mock, 'parameters', [
  [Injector, new Optional()],
  [coreForm.NgControl || /* istanbul ignore next */ (() => undefined), new Optional(), new Self()],
]);

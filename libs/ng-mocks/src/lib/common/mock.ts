import { EventEmitter, Injector, Optional, PipeTransform, Self } from '@angular/core';

import { IMockBuilderConfig } from '../mock-builder/types';
import mockHelperStub from '../mock-helper/mock-helper.stub';
import mockInstanceApply from '../mock-instance/mock-instance-apply';
import helperMockService from '../mock-service/helper.mock-service';

import coreDefineProperty from './core.define-property';
import coreForm from './core.form';
import { mapValues } from './core.helpers';
import { AnyType, DirectiveIo } from './core.types';
import funcDirectiveIoParse from './func.directive-io-parse';
import funcIsMock from './func.is-mock';
import { MockControlValueAccessorProxy } from './mock-control-value-accessor-proxy';
import ngMocksUniverse from './ng-mocks-universe';

const setValueAccessor = (instance: any, ngControl?: any) => {
  if (ngControl && !ngControl.valueAccessor && instance.__ngMocksConfig.setControlValueAccessor) {
    try {
      // This is the long-standing path for declarations that do not provide their own
      // NG_VALUE_ACCESSOR. In that case ng-mocks still creates the proxy eagerly and assigns
      // it to ngControl.valueAccessor, which matches Angular's older behavior.
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

// Angular <= 22.0.0-next.3 selected the final value accessor eagerly in forms directives and
// exposed it on ngControl.valueAccessor before the mock constructor ran. Angular >= 22.0.0-next.4
// keeps the candidates around lazily and can expose them through rawValueAccessors and later DI
// lookups before finally assigning valueAccessor during control setup. ng-mocks has to inspect all
// of these sources so the same mock still receives registerOnChange / writeValue calls on both the
// old and the new Angular implementations.
const extractValueAccessors = (ngControl: any, injector: Injector | null | undefined): any[] =>
  extractUniqueProxies([
    ...normalizeProxies(ngControl?.valueAccessor),
    ...normalizeProxies(ngControl?.rawValueAccessors),
    ...extractInjectableProxies(injector, coreForm.NG_VALUE_ACCESSOR),
  ]);

// Validators and async validators were affected by the same Angular change in practice: older
// versions exposed the selected validators directly on the control, while newer versions can defer
// resolution and re-read them from DI. Collecting both locations keeps the ng-mocks hookup logic
// compatible with previous Angular versions and the new lazy resolution model.
const extractValidators = (
  ngControl: any,
  injector: Injector | null | undefined,
  property: string,
  token: any,
): any[] =>
  extractUniqueProxies([
    ...normalizeProxies(ngControl?.[property]),
    ...extractInjectableProxies(injector, token),
  ]);

// connecting to NG_VALUE_ACCESSOR
const installValueAccessor = (ngControl: any, instance: any, injector?: Injector | null) => {
  for (const valueAccessor of extractValueAccessors(ngControl, injector)) {
    // Angular can surface multiple candidates here, including duplicates and proxies that belong
    // to the original declaration instead of the generated mock class. Only the proxy created for
    // the current mock ctor should be wired, and already-wired proxies must stay untouched.
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
    // The same target check is required for validators so that lazy Angular resolution cannot bind
    // the mock instance to a proxy that was created for a different declaration or bind twice.
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
      // New Angular forms versions can defer the final accessor / validator selection until later
      // control setup, but tests interact with mocks immediately after creation. Discovering and
      // wiring every compatible proxy shape here preserves the previous observable behavior without
      // requiring version-specific test changes.
      installValueAccessor(ngControl, instance, injector);
      installValidator(
        extractValidators(ngControl, injector, '_rawValidators', coreForm.NG_VALIDATORS),
        instance,
      );
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
  outputs?: Array<DirectiveIo>;
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
      applyNgValueAccessor(this, ngControl, injector);
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

import { Provider } from '@angular/core';

import coreConfig from '../common/core.config';
import { Type } from '../common/core.types';
import funcGetType from '../common/func.get-type';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import ngMocksUniverse from '../common/ng-mocks-universe';

import helperDefinePropertyDescriptor from './helper.define-property-descriptor';
import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';
import helperUseFactory from './helper.use-factory';
import { MockService } from './mock-service';

const { neverMockProvidedFunction, neverMockToken } = coreConfig;

const applyMissingClassProperties = (instance: any, useClass: Type<any>) => {
  const existing = Object.getOwnPropertyNames(instance);
  const child = MockService(useClass);

  for (const name of Object.getOwnPropertyNames(child)) {
    if (existing.indexOf(name) !== -1) {
      continue;
    }
    const def = helperExtractPropertyDescriptor(child, name);
    helperDefinePropertyDescriptor(instance, name, def);
  }
};

const createFactoryProvider = (provider: any, provide: any) =>
  helperUseFactory(provide, () => {
    const instance = MockService(provide);
    // Magic below adds missed properties to the instance to
    // fulfill missed abstract methods.
    if (provide !== provider && Object.keys(provider).indexOf('useClass') !== -1) {
      applyMissingClassProperties(instance, provider.useClass);
    }

    return instance;
  });

const normalizePrimitivesMap: Array<[(value: any) => boolean, any]> = [
  [value => typeof value === 'boolean', false],
  [value => typeof value === 'number', 0],
  [value => typeof value === 'string', ''],
  [value => value === null, null],
];

const normalizePrimitives = (value: any): any => {
  for (const [check, result] of normalizePrimitivesMap) {
    if (check(value)) {
      return result;
    }
  }

  return undefined;
};

const createValueProvider = (provider: any, provide: any) =>
  helperUseFactory(provide, () =>
    provider.useValue && typeof provider.useValue === 'object'
      ? MockService(provider.useValue)
      : normalizePrimitives(provider.useValue),
  );

const createClassProvider = (provider: any, provide: any) =>
  ngMocksUniverse.builtProviders.has(provider.useClass) &&
  ngMocksUniverse.builtProviders.get(provider.useClass) === provider.useClass
    ? provider
    : helperUseFactory(provide, () => MockService(provider.useClass));

const createMockProvider = (provider: any, provide: any, cacheProviders?: Map<any, any>): Provider | undefined => {
  let mockProvider: Provider | undefined;
  if (typeof provide === 'function') {
    mockProvider = createFactoryProvider(provider, provide);
  }
  if (provide === provider && mockProvider && cacheProviders) {
    cacheProviders.set(provide, mockProvider);
  }

  return mockProvider;
};

// Tokens are special subject, we can skip adding them because in a mock module they are useless.
// The main problem is that providing undefined to HTTP_INTERCEPTORS and others breaks their code.
// If a testing module / component requires omitted tokens then they should be provided manually
// during creation of TestBed module.
const handleProvider = (provider: any, provide: any, useFactory: boolean) => {
  if (provide === provider) {
    return useFactory ? helperUseFactory(provider, () => undefined) : undefined;
  }
  if (provider.multi) {
    ngMocksUniverse.config.get('ngMocksMulti')?.add(provide);

    return undefined;
  }

  let mockProvider: any;
  // istanbul ignore else
  if (Object.keys(provider).indexOf('useValue') !== -1) {
    mockProvider = createValueProvider(provider, provide);
  } else if (Object.keys(provider).indexOf('useExisting') !== -1) {
    mockProvider = provider;
  } else if (Object.keys(provider).indexOf('useClass') !== -1) {
    mockProvider = createClassProvider(provider, provide);
  } else if (Object.keys(provider).indexOf('useFactory') !== -1) {
    mockProvider = helperUseFactory(provide, () => ({}));
  }

  return mockProvider;
};

const isNeverMockFunction = (provide: any): boolean =>
  typeof provide === 'function' && neverMockProvidedFunction.indexOf(provide.name) !== -1;

const isNeverMockToken = (provide: any): boolean =>
  isNgInjectionToken(provide) && neverMockToken.indexOf(provide.toString()) !== -1;

export default (provider: any, useFactory = false): Provider | undefined => {
  const provide = funcGetType(provider);

  if (ngMocksUniverse.getResolution(provide) === 'mock') {
    // nothing to do
  } else if (isNeverMockFunction(provide)) {
    return provider;
  } else if (isNeverMockToken(provide)) {
    return undefined;
  }

  // Only pure provides should be cached to avoid their influence on
  // another different declarations.
  const cacheProviders = ngMocksUniverse.flags.has('cacheProvider')
    ? ngMocksUniverse.cacheProviders
    : /* istanbul ignore next */ undefined;
  if (provide === provider && cacheProviders && cacheProviders.has(provide)) {
    return cacheProviders.get(provide);
  }

  return createMockProvider(provider, provide, cacheProviders) || handleProvider(provider, provide, useFactory);
};

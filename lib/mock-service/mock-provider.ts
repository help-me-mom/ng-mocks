import { Provider } from '@angular/core';

import coreConfig from '../common/core.config';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import ngMocksUniverse from '../common/ng-mocks-universe';

import helperUseFactory from './helper.use-factory';
import { MockService } from './mock-service';

const { neverMockProvidedFunction, neverMockToken } = coreConfig;

const createFactoryProvider = (provider: any, provide: any) =>
  helperUseFactory(provide, () => {
    const instance = MockService(provide);
    // Magic below adds missed properties to the instance to
    // fulfill missed abstract methods.
    if (provide !== provider && Object.keys(provider).indexOf('useClass') !== -1) {
      const existing = Object.getOwnPropertyNames(instance);
      const child = MockService(provider.useClass);
      for (const name of Object.getOwnPropertyNames(child)) {
        if (existing.indexOf(name) !== -1) {
          continue;
        }
        const def = Object.getOwnPropertyDescriptor(child, name);
        // istanbul ignore else
        if (def) {
          Object.defineProperty(instance, name, def);
        }
      }
    }

    return instance;
  });

const createValueProvider = (provider: any, provide: any) =>
  provider.useValue && typeof provider.useValue === 'object'
    ? helperUseFactory(provide, () => MockService(provider.useValue))
    : {
        provide,
        useValue:
          typeof provider.useValue === 'boolean'
            ? false
            : typeof provider.useValue === 'number'
            ? 0
            : typeof provider.useValue === 'string'
            ? ''
            : provider.useValue === null
            ? null
            : undefined,
      };

const createClassProvider = (provider: any, provide: any) =>
  ngMocksUniverse.builtProviders.has(provider.useClass) &&
  ngMocksUniverse.builtProviders.get(provider.useClass) === provider.useClass
    ? provider
    : helperUseFactory(provide, () => MockService(provider.useClass));

const createMockProvider = (provider: any, provide: any): Provider | undefined => {
  let mockProvider: Provider | undefined;

  if (typeof provide === 'function') {
    mockProvider = createFactoryProvider(provider, provide);
  }

  return mockProvider;
};

const handleProvider = (provider: any, provide: any) => {
  // Not sure if this case is possible, all classes should be already
  // replaced with their mock copies by the code above, below we
  // should have only tokens and string literals with a proper definition.
  if (provide === provider) {
    return undefined;
  }

  // Tokens are special subject, we can skip adding them because in a mock module they are useless.
  // The main problem is that providing undefined to HTTP_INTERCEPTORS and others breaks their code.
  // If a testing module / component requires omitted tokens then they should be provided manually
  // during creation of TestBed module.
  if (provider.multi) {
    ngMocksUniverse.config.get('multi')?.add(provide);

    return undefined;
  }

  let mockProvider: any;

  // if a token has a primitive type, we can return its initial state.
  // istanbul ignore else
  if (Object.keys(provider).indexOf('useValue') !== -1) {
    mockProvider = createValueProvider(provider, provide);
  } else if (!mockProvider && Object.keys(provider).indexOf('useExisting') !== -1) {
    mockProvider = provider;
  } else if (!mockProvider && Object.keys(provider).indexOf('useClass') !== -1) {
    mockProvider = createClassProvider(provider, provide);
  } else if (!mockProvider && Object.keys(provider).indexOf('useFactory') !== -1) {
    mockProvider = helperUseFactory(provide, () => ({}));
  }

  return mockProvider;
};

export default function (provider: any): Provider | undefined {
  const provide = typeof provider === 'object' && provider.provide ? provider.provide : provider;

  if (typeof provide === 'function' && neverMockProvidedFunction.indexOf(provide.name) !== -1) {
    return provider;
  }
  if (isNgInjectionToken(provide) && neverMockToken.indexOf(provide.toString()) !== -1) {
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
  const mockProvider = createMockProvider(provider, provide);
  if (provide === provider && mockProvider && cacheProviders) {
    cacheProviders.set(provide, mockProvider);
  }

  return mockProvider || handleProvider(provider, provide);
}

import { Provider } from '@angular/core';

import ngConfig from '../common/core.config';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import { ngMocksUniverse } from '../common/ng-mocks-universe';

import useFactory from './helper.use-factory';
import { MockService } from './mock-service';

const { neverMockProvidedFunction, neverMockToken } = ngConfig;

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
  if (
    provide === provider &&
    ngMocksUniverse.flags.has('cacheProvider') &&
    ngMocksUniverse.cacheProviders.has(provide)
  ) {
    return ngMocksUniverse.cacheProviders.get(provide);
  }

  let mockProvider: Provider | undefined;
  if (typeof provide === 'function' && !mockProvider) {
    mockProvider = useFactory(ngMocksUniverse.cacheMocks.get(provide) || provide, () => {
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
          /* istanbul ignore else */
          if (def) {
            Object.defineProperty(instance, name, def);
          }
        }
      }
      return instance;
    });
  }

  if (provide === provider && mockProvider && ngMocksUniverse.flags.has('cacheProvider')) {
    ngMocksUniverse.cacheProviders.set(provide, mockProvider);
  }
  if (mockProvider) {
    return mockProvider;
  }

  // Not sure if this case is possible, all classes should be already
  // replaced with their mock coplies by the code above, below we
  // should have only tokens and string literals with a proper definition.
  if (provide === provider) {
    return undefined;
  }

  // Tokens are special subject, we can skip adding them because in a mock module they are useless.
  // The main problem is that providing undefined to HTTP_INTERCEPTORS and others breaks their code.
  // If a testing module / component requires omitted tokens then they should be provided manually
  // during creation of TestBed module.
  if (provider.multi) {
    if (ngMocksUniverse.config.has('multi')) {
      (ngMocksUniverse.config.get('multi') as Set<any>).add(provide);
    }
    return undefined;
  }

  // if a token has a primitive type, we can return its initial state.
  if (!mockProvider && Object.keys(provider).indexOf('useValue') !== -1) {
    mockProvider =
      provider.useValue && typeof provider.useValue === 'object'
        ? useFactory(ngMocksUniverse.cacheMocks.get(provide) || provide, () => MockService(provider.useValue))
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
  }
  if (!mockProvider && Object.keys(provider).indexOf('useExisting') !== -1) {
    mockProvider = provider;
  }
  if (!mockProvider && Object.keys(provider).indexOf('useClass') !== -1) {
    mockProvider =
      ngMocksUniverse.builder.has(provider.useClass) &&
      ngMocksUniverse.builder.get(provider.useClass) === provider.useClass
        ? provider
        : useFactory(ngMocksUniverse.cacheMocks.get(provide) || provide, () => MockService(provider.useClass));
  }
  if (!mockProvider && Object.keys(provider).indexOf('useFactory') !== -1) {
    mockProvider = useFactory(ngMocksUniverse.cacheMocks.get(provide) || provide, () => ({}));
  }

  return mockProvider;
}

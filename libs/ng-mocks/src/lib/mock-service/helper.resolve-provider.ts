import CoreDefStack from '../common/core.def-stack';
import { extractDependency } from '../common/core.helpers';
import { NG_MOCKS_INTERCEPTORS } from '../common/core.tokens';
import funcExtractForwardRef from '../common/func.extract-forward-ref';
import funcGetProvider from '../common/func.get-provider';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import ngMocksUniverse from '../common/ng-mocks-universe';

import helperMockService from './helper.mock-service';
import mockProvider from './mock-provider';

const anyDiffers = (a: any, b: any, ...keys: string[]): boolean => {
  for (const key of keys) {
    if (a[key] !== b[key]) {
      return true;
    }
  }

  return false;
};

const createFromResolution = (provide: any, resolution: any) => {
  let mockDef = resolution;

  const existingMock = ngMocksUniverse.builtProviders.get(provide);
  if (existingMock) {
    mockDef = existingMock;
  }

  // A case when a provider is actually a component, directive, pipe.
  if (typeof mockDef === 'function') {
    mockDef = {
      provide,
      useClass: mockDef,
    };
  }

  return mockDef;
};

const isSuitableProvider = (provider: any, provide: any): boolean =>
  ngMocksUniverse.builtProviders.has(NG_MOCKS_INTERCEPTORS) &&
  ngMocksUniverse.builtProviders.get(NG_MOCKS_INTERCEPTORS) === null &&
  isNgInjectionToken(provide) &&
  provide.toString() === 'InjectionToken HTTP_INTERCEPTORS' &&
  provide !== provider;

const excludeInterceptors = (provider: any, provide: any): boolean => {
  if (isSuitableProvider(provider, provide)) {
    if (provider.useFactory || provider.useValue) {
      return true;
    }
    const interceptor = funcExtractForwardRef(provider.useExisting) || provider.useClass;
    if (!ngMocksUniverse.builtProviders.has(interceptor) || ngMocksUniverse.builtProviders.get(interceptor) === null) {
      return true;
    }
  }

  return false;
};

const parseProvider = (
  provider: any,
  callback: any,
): {
  change: () => void;
  multi: boolean;
  provide: any;
} => {
  const provide = funcGetProvider(provider);
  const multi = provider !== provide && !!provider.multi;

  return {
    change: () => {
      if (callback) {
        callback();
      }
    },
    multi,
    provide,
  };
};

// if the provider is a value, we need to go through the value and to replace all mock instances.
const replaceWithMocks = (provider: any, provide: any, mockDef: any) => {
  if (provide !== provider && mockDef && mockDef.useValue) {
    const useValue = helperMockService.replaceWithMocks(mockDef.useValue);

    return useValue === mockDef.useValue
      ? mockDef
      : {
          ...mockDef,
          useValue,
        };
  }

  return mockDef;
};

const createPredefinedMockProvider = (provider: any, provide: any): any => {
  // Then we check decisions whether we should keep or replace a provider.
  if (ngMocksUniverse.builtProviders.has(provide)) {
    const mockDef = ngMocksUniverse.builtProviders.get(provide);
    if (mockDef === provide) {
      return provider;
    }

    return mockDef;
  }

  return undefined;
};

const createMockProvider = (provider: any, provide: any, change: () => void) => {
  let mockDef = createPredefinedMockProvider(provider, provide);

  if (!mockDef && ngMocksUniverse.flags.has('skipMock') && ngMocksUniverse.getResolution(provide) !== 'mock') {
    ngMocksUniverse.config.get('ngMocksDepsSkip')?.add(provide);
    mockDef = provider;
  }
  if (!mockDef) {
    mockDef = mockProvider(provider);
  }

  mockDef = replaceWithMocks(provider, provide, mockDef);
  if (!areEqualDefs(mockDef, provider, provide)) {
    change();
  }
  // Touching only when we really provide a value.
  if (mockDef) {
    ngMocksUniverse.touches.add(provide);
  }

  return mockDef;
};

const areEqualDefs = (mockDef: any, provider: any, provide: any): boolean => {
  let providerDiffers = false;
  let defDiffers = !mockDef;
  if (provider && mockDef && !defDiffers) {
    defDiffers = anyDiffers(provider, mockDef, 'provide', 'useValue', 'useClass', 'useExisting', 'useFactory', 'deps');
  }
  if (provider === provide && mockDef !== provider) {
    providerDiffers = true;
  } else if (provider !== provide && defDiffers) {
    providerDiffers = true;
  }

  return !providerDiffers;
};

const isPreconfiguredDependency = (provider: any, provide: any): boolean => {
  //  we should not touch excluded providers.
  if (ngMocksUniverse.builtProviders.get(provide) === null) {
    return true;
  }

  if (provide !== provider && provider.deps) {
    extractDependency(provider.deps, ngMocksUniverse.config.get('ngMocksDeps'));
  }

  return excludeInterceptors(provider, provide);
};

const isPreconfiguredUseExisting = (provider: any, provide: any): boolean => {
  //  we should not touch non-useExisting providers.
  if (!provider || typeof provider !== 'object' || !provider.useExisting) {
    return false;
  }
  if (provider.useExisting.mockOf) {
    return true;
  }

  // skipping explicit declarations (not internally processed)
  if (ngMocksUniverse.getResolution(provide) && !ngMocksUniverse.config.get(provide).__internal) {
    return false;
  }

  return ngMocksUniverse.getResolution(funcExtractForwardRef(provider.useExisting)) === 'keep';
};

// tries to resolve a provider based on current universe state.
export default (provider: any, resolutions: CoreDefStack<any, any>, changed?: () => void) => {
  const { provide, multi, change } = parseProvider(provider, changed);
  if (isPreconfiguredDependency(provider, provide)) {
    return change();
  }
  if (isPreconfiguredUseExisting(provider, provide)) {
    ngMocksUniverse.touches.add(provide);

    return provider;
  }
  if (resolutions.has(provide)) {
    return createFromResolution(provide, resolutions.get(provide));
  }

  const mockDef = createMockProvider(provider, provide, change);

  return multi && typeof mockDef === 'object' ? { ...mockDef, multi } : mockDef;
};

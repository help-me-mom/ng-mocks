import { extractDependency } from '../common/core.helpers';
import { NG_MOCKS_INTERCEPTORS } from '../common/core.tokens';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import { ngMocksUniverse } from '../common/ng-mocks-universe';

import mockServiceHelper from './helper';
import MockProvider from './mock-provider';

// tries to resolve a provider based on current universe state.
export default (def: any, resolutions: Map<any, any>, changed?: (flag: boolean) => void) => {
  const provider = typeof def === 'object' && def.provide ? def.provide : def;
  const multi = def !== provider && !!def.multi;

  //  we shouldn't touch our system providers.
  if (typeof def === 'object' && def.useExisting && def.useExisting.__ngMocksSkip) {
    return def;
  }

  let mockDef: typeof def;
  if (resolutions.has(provider)) {
    mockDef = resolutions.get(provider);
    // A case when a provider is actually a component, directive, pipe.
    if (typeof mockDef === 'function') {
      mockDef = {
        provide: provider,
        useClass: mockDef,
      };
    }
    return multi && typeof mockDef === 'object' ? { ...mockDef, multi } : mockDef;
  }

  //  we shouldn't touch excluded providers.
  if (ngMocksUniverse.builder.has(provider) && ngMocksUniverse.builder.get(provider) === null) {
    /* istanbul ignore else */
    if (changed) {
      changed(true);
    }
    return;
  }

  if (provider !== def && def.deps) {
    extractDependency(def.deps, ngMocksUniverse.config.get('deps'));
  }

  if (
    ngMocksUniverse.builder.has(NG_MOCKS_INTERCEPTORS) &&
    ngMocksUniverse.builder.get(NG_MOCKS_INTERCEPTORS) === null &&
    isNgInjectionToken(provider) &&
    provider.toString() === 'InjectionToken HTTP_INTERCEPTORS' &&
    provider !== def
  ) {
    if (def.useFactory || def.useValue) {
      /* istanbul ignore else */
      if (changed) {
        changed(true);
      }
      return;
    }
    const interceptor = def.useExisting || def.useClass;
    if (!ngMocksUniverse.builder.has(interceptor) || ngMocksUniverse.builder.get(interceptor) === null) {
      /* istanbul ignore else */
      if (changed) {
        changed(true);
      }
      return;
    }
  }

  // Then we check decisions whether we should keep or replace a def.
  if (!mockDef && ngMocksUniverse.builder.has(provider)) {
    mockDef = ngMocksUniverse.builder.get(provider);
    if (mockDef === provider) {
      mockDef = def;
    } else if (mockDef === undefined) {
      mockDef = {
        provide: provider,
        useValue: undefined,
      };
    }
  }

  if (!mockDef && ngMocksUniverse.flags.has('skipMock')) {
    ngMocksUniverse.config.get('depsSkip')?.add(provider);
    mockDef = def;
  }
  if (!mockDef) {
    mockDef = MockProvider(def);
  }
  // if provider is a value, we need to go through the value and to replace all mock instances.
  if (provider !== def && mockDef && mockDef.useValue) {
    const useValue = mockServiceHelper.replaceWithMocks(mockDef.useValue);
    mockDef =
      useValue === mockDef.useValue
        ? mockDef
        : {
            ...mockDef,
            useValue,
          };
  }

  if (!isNgInjectionToken(provider) || def !== mockDef) {
    resolutions.set(provider, mockDef);
  }
  let differs = false;
  if (def === provider && mockDef !== def) {
    differs = true;
  } else if (
    def !== provider &&
    (!mockDef ||
      def.provide !== mockDef.provide ||
      def.useValue !== mockDef.useValue ||
      def.useClass !== mockDef.useClass ||
      def.useExisting !== mockDef.useExisting ||
      def.useFactory !== mockDef.useFactory ||
      def.deps !== mockDef.deps)
  ) {
    differs = true;
  }
  if (changed && differs) {
    changed(true);
  }

  // Touching only when we really provide a value.
  if (mockDef) {
    ngMocksUniverse.touches.add(provider);
  }

  return multi && typeof mockDef === 'object' ? { ...mockDef, multi } : mockDef;
};

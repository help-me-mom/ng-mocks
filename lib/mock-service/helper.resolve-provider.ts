import { NG_INTERCEPTORS } from '../common/core.tokens';
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

  let mockedDef: typeof def;
  if (resolutions.has(provider)) {
    mockedDef = resolutions.get(provider);
    // A case when a provider is actually a component, directive, pipe.
    if (typeof mockedDef === 'function') {
      mockedDef = {
        provide: provider,
        useClass: mockedDef,
      };
    }
    return multi && typeof mockedDef === 'object' ? { ...mockedDef, multi } : mockedDef;
  }

  //  we shouldn't touch excluded providers.
  if (ngMocksUniverse.builder.has(provider) && ngMocksUniverse.builder.get(provider) === null) {
    /* istanbul ignore else */
    if (changed) {
      changed(true);
    }
    return;
  }

  if (
    ngMocksUniverse.builder.has(NG_INTERCEPTORS) &&
    ngMocksUniverse.builder.get(NG_INTERCEPTORS) === null &&
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
  if (!mockedDef && ngMocksUniverse.builder.has(provider)) {
    mockedDef = ngMocksUniverse.builder.get(provider);
    if (mockedDef === provider) {
      mockedDef = def;
    } else if (mockedDef === undefined) {
      mockedDef = {
        provide: provider,
        useValue: undefined,
      };
    }
  }

  if (!mockedDef && ngMocksUniverse.flags.has('skipMock')) {
    mockedDef = def;
  }
  if (!mockedDef) {
    mockedDef = MockProvider(def);
  }
  // if provider is a value, we need to go through the value and to replace all mocked instances.
  if (provider !== def && mockedDef && mockedDef.useValue) {
    const useValue = mockServiceHelper.replaceWithMocks(mockedDef.useValue);
    mockedDef =
      useValue === mockedDef.useValue
        ? mockedDef
        : {
            ...mockedDef,
            useValue,
          };
  }

  if (!isNgInjectionToken(provider) || def !== mockedDef) {
    resolutions.set(provider, mockedDef);
  }
  let differs = false;
  if (def === provider && mockedDef !== def) {
    differs = true;
  } else if (
    def !== provider &&
    (!mockedDef ||
      def.provide !== mockedDef.provide ||
      def.useValue !== mockedDef.useValue ||
      def.useClass !== mockedDef.useClass ||
      def.useExisting !== mockedDef.useExisting ||
      def.useFactory !== mockedDef.useFactory ||
      def.deps !== mockedDef.deps)
  ) {
    differs = true;
  }
  if (changed && differs) {
    changed(true);
  }

  // Touching only when we really provide a value.
  if (mockedDef) {
    ngMocksUniverse.touches.add(provider);
  }

  return multi && typeof mockedDef === 'object' ? { ...mockedDef, multi } : mockedDef;
};

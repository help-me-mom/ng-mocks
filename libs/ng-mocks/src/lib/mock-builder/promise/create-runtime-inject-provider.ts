import { Injector, Provider } from '@angular/core';
import * as angularCore from '@angular/core';

import { NG_MOCKS_ROOT_PROVIDERS, NG_MOCKS_TOUCHES } from '../../common/core.tokens';
import { isNgDef } from '../../common/func.is-ng-def';
import { isStandalone } from '../../common/func.is-standalone';
import { installRuntimeInject, runRuntimeInject } from '../../common/ng-mocks-runtime-inject';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (
  keepDef: Set<any>,
  configDef: Map<any, any>,
  providers: any[],
  autoMockRootProviders: boolean,
): Provider | undefined => {
  const environmentInitializer = (angularCore as any).ENVIRONMENT_INITIALIZER;
  if (!environmentInitializer || keepDef.has(NG_MOCKS_ROOT_PROVIDERS)) {
    return undefined;
  }

  const declarations = new Set<any>();
  // Kept modules preserve their root providers, but one-argument MockBuilder
  // calls auto-mock root dependencies for classic declarations too.
  let autoMockDeclarations = autoMockRootProviders;
  for (const def of keepDef) {
    if (isNgDef(def, 'm')) {
      autoMockDeclarations = false;
      break;
    }
  }
  for (const def of keepDef) {
    const isDeclaration = isNgDef(def, 'c') || isNgDef(def, 'd') || isNgDef(def, 'p');
    if ((isStandalone(def) || autoMockDeclarations) && isDeclaration) {
      declarations.add(def);
    }
    if (!isDeclaration && configDef.get(def).shallow === false && typeof def === 'function' && def.ɵprov?.factory) {
      const provider = ngMocksUniverse.builtProviders.get(def);
      const providerIndex = providers.indexOf(provider);
      if (providerIndex === -1) {
        continue;
      }

      const useFactory = provider === def ? def.ɵfac : provider.useFactory;
      const dependencies = provider === def ? [] : (provider.deps ?? []);
      providers[providerIndex] = {
        deps: [Injector, NG_MOCKS_TOUCHES, ...dependencies],
        provide: def,
        useFactory: (injector: Injector, touches: Set<any>, ...args: any[]) => {
          installRuntimeInject(injector, declarations, touches);

          return runRuntimeInject(injector, () => useFactory(...args));
        },
      };
    }
  }
  if (declarations.size === 0) {
    return undefined;
  }

  return {
    deps: [Injector, NG_MOCKS_TOUCHES],
    multi: true,
    provide: environmentInitializer,
    useFactory: (injector: Injector, touches: Set<any>) => () => installRuntimeInject(injector, declarations, touches),
  };
};

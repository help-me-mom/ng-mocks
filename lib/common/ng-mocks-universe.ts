import { InjectionToken } from '@angular/core';

import coreConfig from './core.config';
import { AnyType } from './core.types';

// istanbul ignore next
const getGlobal = (): any => window || global;

interface NgMocksUniverse {
  builtDeclarations: Map<any, any>;
  builtProviders: Map<any, any>;
  cacheDeclarations: Map<any, any>;
  cacheProviders: Map<any, any>;
  config: Map<any, any>;
  flags: Set<string>;
  global: Map<any, any>;
  isExcludedDef: (def: any) => boolean;
  isProvidedDef: (def: any) => boolean;
  touches: Set<AnyType<any> | InjectionToken<any> | string>;
}

getGlobal().ngMocksUniverse = getGlobal().ngMocksUniverse || {
  builtDeclarations: new Map(),
  builtProviders: new Map(),
  cacheDeclarations: new Map(),
  cacheProviders: new Map(),
  config: new Map(),
  flags: new Set<string>(coreConfig.flags),
  getOverrides: (): Map<any, any> => {
    if (!getGlobal().ngMocksUniverse.global.has('overrides')) {
      getGlobal().ngMocksUniverse.global.set('overrides', new Map());
    }

    return getGlobal().ngMocksUniverse.global.get('overrides');
  },
  global: new Map(),
  isExcludedDef: (def: any): boolean =>
    getGlobal().ngMocksUniverse.builtDeclarations.has(def) &&
    getGlobal().ngMocksUniverse.builtDeclarations.get(def) === null,
  isProvidedDef: (def: any): boolean =>
    getGlobal().ngMocksUniverse.builtDeclarations.has(def) &&
    getGlobal().ngMocksUniverse.builtDeclarations.get(def) !== null,
  touches: new Set<AnyType<any> | InjectionToken<any>>(),
};

/**
 * DO NOT USE this object outside of the library.
 * It can be changed any time without a notice.
 *
 * @internal
 */
export default ((): NgMocksUniverse => getGlobal().ngMocksUniverse)();

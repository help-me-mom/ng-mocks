import { InjectionToken } from '@angular/core';

import coreConfig from './core.config';
import { AnyType } from './core.types';

// istanbul ignore next
const getGlobal = (): any => window || global;

getGlobal().ngMocksUniverse = getGlobal().ngMocksUniverse || {
  builtDeclarations: new Map(),
  builtProviders: new Map(),
  cacheDeclarations: new Map(),
  cacheProviders: new Map(),
  config: new Map(),
  flags: new Set<string>(coreConfig.flags),
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
export default (() => getGlobal().ngMocksUniverse)();

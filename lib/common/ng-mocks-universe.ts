import { InjectionToken, Type } from '@angular/core';

/**
 * Can be changed any time.
 *
 * @internal
 */
export const ngMocksUniverse = {
  builder: new Map(),
  cache: new Map(),
  config: new Map(),
  flags: new Set<string>(['cacheModule', 'cacheComponent', 'cacheDirective', 'cacheProvider']),
  touches: new Set<Type<any> | InjectionToken<any>>(),
};

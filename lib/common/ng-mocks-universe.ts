import { InjectionToken } from '@angular/core';

import { AnyType } from './core.types';

/**
 * Can be changed any time.
 *
 * @internal
 */
export const ngMocksUniverse = {
  builder: new Map(),
  cacheMocks: new Map(),
  cacheProviders: new Map(),
  config: new Map(),
  flags: new Set<string>(['cacheModule', 'cacheComponent', 'cacheDirective', 'cacheProvider']),
  global: new Map(),
  touches: new Set<AnyType<any> | InjectionToken<any>>(),
};

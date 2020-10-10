import { InjectionToken } from '@angular/core';

import { AbstractType, Type } from './lib';

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
  resetOverrides: new Set(),
  touches: new Set<Type<any> | AbstractType<any> | InjectionToken<any>>(),
};

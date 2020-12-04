import { InjectionToken, Injector } from '@angular/core';

import { AnyType } from '../common/core.types';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default <T>(
  def: AnyType<T> | InjectionToken<T> | string,
  callback?: (instance: undefined | T, injector: Injector) => void | Partial<T>,
): void => {
  const map = ngMocksUniverse.getOverrides();
  if (callback) {
    const set: Set<any> = map.has(def) ? map.get(def) : new Set();
    set.add(callback);
    map.set(def, set);
  } else {
    map.delete(def);
  }
};

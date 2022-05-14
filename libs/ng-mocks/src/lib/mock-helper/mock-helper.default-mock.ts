import { Injector } from '@angular/core';

import { flatten } from '../common/core.helpers';
import { AnyDeclaration } from '../common/core.types';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default <T>(
  def: AnyDeclaration<T> | string | Array<AnyDeclaration<T> | string>,
  callback?: (instance: undefined | T, injector: Injector) => void | Partial<T>,
): void => {
  const map = ngMocksUniverse.getOverrides();
  for (const item of flatten(def)) {
    if (callback) {
      const set: Set<any> = map.has(item) ? map.get(item) : new Set();
      set.add(callback);
      map.set(item, set);
    } else {
      map.delete(item);
    }
  }
};

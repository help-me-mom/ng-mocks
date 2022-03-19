import { InjectionToken } from '@angular/core';

import { flatten } from '../common/core.helpers';
import { AnyType } from '../common/core.types';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { IMockBuilderConfig } from '../mock-builder/types';

export default <T>(
  def: AnyType<T> | InjectionToken<T> | string | Array<AnyType<T> | InjectionToken<T> | string>,
  config?: IMockBuilderConfig,
): void => {
  const map = ngMocksUniverse.getConfigMock();
  for (const item of flatten(def)) {
    if (config) {
      map.set(item, config);
    } else {
      map.delete(item);
    }
  }
};

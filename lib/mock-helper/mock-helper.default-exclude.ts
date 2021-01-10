import { InjectionToken } from '@angular/core';

import { AnyType } from '../common/core.types';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default (source: AnyType<any> | InjectionToken<any>): void => {
  ngMocksUniverse.getDefaults().set(source, null);
};

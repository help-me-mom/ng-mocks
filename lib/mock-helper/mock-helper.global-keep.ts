import { InjectionToken } from '@angular/core';

import { AnyType } from '../common/core.types';
import ngMocksUniverse from '../common/ng-mocks-universe';

import funcGlobalPrepare from './func.global-prepare';

export default (source: AnyType<any> | InjectionToken<any>): void => {
  funcGlobalPrepare();
  ngMocksUniverse.getDefaults().set(source, ['keep']);
};

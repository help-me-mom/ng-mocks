import { InjectionToken } from '@angular/core';

import { AnyType } from '../common/core.types';
import ngMocksUniverse from '../common/ng-mocks-universe';

import funcGlobalPrepare from './func.global-prepare';
import mockHelperDefaultMock from './mock-helper.default-mock';

export default (source: AnyType<any> | InjectionToken<any>): void => {
  funcGlobalPrepare();
  ngMocksUniverse.getDefaults().delete(source);
  mockHelperDefaultMock(source);
};

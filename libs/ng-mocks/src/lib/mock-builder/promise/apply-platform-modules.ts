import { getTestBed } from '@angular/core/testing';

import { flatten } from '../../common/core.helpers';
import funcGetType from '../../common/func.get-type';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default () => {
  const testBed = getTestBed();
  // istanbul ignore else
  if (testBed.ngModule) {
    for (const def of flatten<any>(testBed.ngModule)) {
      ngMocksUniverse.touches.add(funcGetType(def));
    }
  }
};

import { getTestBed } from '@angular/core/testing';

import { flatten } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default () => {
  const testBed = getTestBed();
  // istanbul ignore else
  if (testBed.ngModule) {
    for (const def of flatten<any>(testBed.ngModule)) {
      // istanbul ignore if
      if (typeof def === 'object' && /* istanbul ignore next */ def.ngModule) {
        ngMocksUniverse.touches.add(def.ngModule);
      } else {
        ngMocksUniverse.touches.add(def);
      }
    }
  }
};

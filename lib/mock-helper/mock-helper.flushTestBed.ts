// tslint:disable:no-default-export

import { getTestBed } from '@angular/core/testing';

export default (): void => {
  const testBed: any = getTestBed();
  testBed._instantiated = false;
  testBed._moduleFactory = undefined;
  testBed._testModuleRef = null;
};

import { getTestBed } from '@angular/core/testing';

import { resetInjectedDeclarations } from '../common/ng-mocks-injected-declarations';

export default (): void => {
  const testBed: any = getTestBed();
  // TestBed.inject seeds are scoped to the current testing module and must not leak after a flush.
  resetInjectedDeclarations();
  if (testBed.shouldTearDownTestingModule !== undefined && testBed.shouldTearDownTestingModule()) {
    testBed.tearDownTestingModule();
  }
  testBed._instantiated = false;
  testBed._moduleFactory = undefined;
  testBed._testModuleRef = null;
};

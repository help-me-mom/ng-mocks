import { getTestBed } from '@angular/core/testing';

export default (): void => {
  const testBed: any = getTestBed();
  if (testBed.shouldTearDownTestingModule !== undefined && testBed.shouldTearDownTestingModule()) {
    testBed.tearDownTestingModule();
  }
  testBed._instantiated = false;
  testBed._moduleFactory = undefined;
  testBed._testModuleRef = null;
};

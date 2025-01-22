import { getTestBed } from '@angular/core/testing';

import { ngMocks } from 'ng-mocks';

describe('mock-helper-flush-test-bed', () => {
  let originalShouldTearDownTestingModule: any;
  let originalTearDownTestingModule: any;

  beforeAll(() => {
    const testBed: any = getTestBed();
    originalShouldTearDownTestingModule =
      testBed.shouldTearDownTestingModule;
    originalTearDownTestingModule = testBed.tearDownTestingModule;
  });

  afterAll(() => {
    const testBed: any = getTestBed();
    testBed.shouldTearDownTestingModule =
      originalShouldTearDownTestingModule;
    testBed.tearDownTestingModule = originalTearDownTestingModule;
  });

  it('should execute tearDownTestingModule', () => {
    const testBed: any = getTestBed();

    testBed.shouldTearDownTestingModule =
      typeof jest === 'undefined'
        ? jasmine.createSpy('spyShouldTearDown').and.returnValue(true)
        : jest.fn().mockReturnValue(true);

    testBed.tearDownTestingModule =
      typeof jest === 'undefined'
        ? jasmine.createSpy('spyTearDown')
        : jest.fn();

    ngMocks.flushTestBed();
    expect(testBed.tearDownTestingModule).toHaveBeenCalledTimes(1);
  });

  it('should not execute tearDownTestingModule', () => {
    const testBed: any = getTestBed();

    testBed.shouldTearDownTestingModule =
      typeof jest === 'undefined'
        ? jasmine
            .createSpy('spyShouldTearDown')
            .and.returnValue(false)
        : jest.fn().mockReturnValue(false);

    testBed.tearDownTestingModule =
      typeof jest === 'undefined'
        ? jasmine.createSpy('spyTearDown')
        : jest.fn();

    ngMocks.flushTestBed();
    expect(testBed.tearDownTestingModule).not.toHaveBeenCalled();
  });
});

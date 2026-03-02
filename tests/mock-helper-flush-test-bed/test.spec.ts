import { getTestBed } from '@angular/core/testing';

import { ngMocks } from 'ng-mocks';

import { createMock, mockReturnValue } from '../mock-helpers';

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

    testBed.shouldTearDownTestingModule = mockReturnValue(
      createMock('spyShouldTearDown'),
      true,
    );

    testBed.tearDownTestingModule = createMock('spyTearDown');

    ngMocks.flushTestBed();
    expect(testBed.tearDownTestingModule).toHaveBeenCalledTimes(1);
  });

  it('should not execute tearDownTestingModule', () => {
    const testBed: any = getTestBed();

    testBed.shouldTearDownTestingModule = mockReturnValue(
      createMock('spyShouldTearDown'),
      false,
    );

    testBed.tearDownTestingModule = createMock('spyTearDown');

    ngMocks.flushTestBed();
    expect(testBed.tearDownTestingModule).not.toHaveBeenCalled();
  });
});

import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockProvider, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly info = {
    request: () => 'target',
  };
}

const resetSpy = (spy: any): void => {
  if (typeof jest === 'undefined') {
    spy.calls.reset();
  } else {
    spy.mockClear();
  }
};

// @see https://github.com/help-me-mom/ng-mocks/issues/10919
describe('issue-10919', () => {
  const anyTestBed: any = TestBed;

  beforeEach(() =>
    ngMocks.autoSpy(typeof jest === 'undefined' ? 'jasmine' : 'jest'),
  );

  afterEach(() => ngMocks.autoSpy('reset'));

  beforeEach(() => {
    TestBed.resetTestingModule();

    // The reported case is a service with an own object property.
    // The app calls `service.info.request()`, therefore the mock has to keep the
    // object shape and replace `request` with a callable spy.
    //
    // Before this behavior, mocked provider setup relied on
    // MockService(TargetService), which only mocked the prototype of the class.
    // Because `info` is created as an own property, it was dropped from the
    // mock and `service.info.request()` crashed with:
    // "Cannot read properties of undefined (reading 'request')".
    TestBed.configureTestingModule({
      providers: [MockProvider(TargetService)],
    });
  });

  it('keeps own object properties of a mocked service', () => {
    const service = anyTestBed.get
      ? anyTestBed.get(TargetService)
      : anyTestBed.inject(TargetService);

    // We want the nested object to stay available and its method to be turned
    // into a callable spy, so a provider mock can safely call
    // `service.info.request()` without extra setup.
    expect(service.info).toBeDefined();
    expect(typeof service.info.request).toEqual('function');
    resetSpy(service.info.request);

    service.info.request();

    expect(service.info.request).toHaveBeenCalledTimes(1);
  });
});

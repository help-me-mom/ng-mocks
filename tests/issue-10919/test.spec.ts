import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockProvider, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly info = {
    request: () => 'target',
  };
}

const lookupPropertyDescriptor = (
  instance: any,
  property: string,
): PropertyDescriptor | undefined => {
  let current = instance;

  while (current) {
    const descriptor = Object.getOwnPropertyDescriptor(
      current,
      property,
    );
    if (descriptor) {
      return descriptor;
    }
    current = Object.getPrototypeOf(current);
  }

  return undefined;
};

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
    // Before the fix, mocked provider setup relied on MockService(TargetService),
    // which only mocked the prototype of the class.
    // Because `info` is created as an own property, it was dropped from the
    // mock and `service.info.request()` crashed with:
    // "Cannot read properties of undefined (reading 'request')".
    //
    // The fix teaches MockService to build zero-arg classes from a real
    // instance first, so own object properties are visible and can be mocked.
    TestBed.configureTestingModule({
      providers: [MockProvider(TargetService)],
    });
  });

  it('keeps own object properties of a mocked service', () => {
    const service = anyTestBed.get
      ? anyTestBed.get(TargetService)
      : anyTestBed.inject(TargetService);
    const infoDescriptor = lookupPropertyDescriptor(service, 'info');
    const infoGetSpy: any = infoDescriptor && infoDescriptor.get;
    const requestSpy: any = service.info.request;
    expect(infoGetSpy).toBeDefined();
    expect(requestSpy).toBeDefined();
    if (!infoGetSpy || !requestSpy) {
      return;
    }
    resetSpy(infoGetSpy);
    resetSpy(requestSpy);

    // We want the nested object to stay available and its method to be turned
    // into a callable spy, so a provider mock can safely call
    // `service.info.request()` without extra setup.
    //
    // The property itself also has to stay auto-spied. After the nested call we
    // should be able to assert that reading `service.info` triggered the getter
    // spy and that invoking `service.info.request()` triggered the nested spy.
    service.info.request();

    expect(infoGetSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });
});

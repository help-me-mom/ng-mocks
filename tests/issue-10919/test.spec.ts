import { Injectable } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly info = {
    request: () => 'target',
  };
}

// @see https://github.com/help-me-mom/ng-mocks/issues/10919
describe('issue-10919', () => {
  beforeEach(() =>
    // The reported case is a service with an own object property.
    // The app calls `service.info.request()`, therefore the mock has to keep the
    // object shape and replace `request` with a callable spy.
    //
    // Before the fix, MockBuilder().mock(TargetService) relied on
    // MockService(TargetService), which only mocked the prototype of the class.
    // Because `info` is created as an own property, it was dropped from the
    // mock and `service.info.request()` crashed with:
    // "Cannot read properties of undefined (reading 'request')".
    //
    // The fix teaches MockService to build zero-arg classes from a real
    // instance first, so own object properties are visible and can be mocked.
    MockBuilder().mock(TargetService),
  );

  it('keeps own object properties of a mocked service', () => {
    const service = ngMocks.findInstance(TargetService);

    // We want the nested object to stay available and its method to be turned
    // into a callable spy. That preserves the reported public usage without
    // requiring manual overrides in the test.
    expect(service.info).toBeDefined();
    expect(typeof service.info.request).toEqual('function');
    expect(service.info.request()).toBeUndefined();
  });
});

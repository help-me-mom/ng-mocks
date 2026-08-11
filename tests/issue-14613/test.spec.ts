import { effect, Injectable } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class TargetInterceptor {
  public constructor() {
    effect(() => undefined);
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14613
// Angular 22 effects require the framework's root EffectScheduler. MockBuilder
// used to replace it with an empty class mock, so the first effect creation
// failed because the mock scheduler did not implement `add`.
describe('issue-14613', () => {
  beforeEach(() => MockBuilder(TargetInterceptor));

  it('creates a root service which registers an effect', () => {
    expect(() =>
      ngMocks.findInstance(TargetInterceptor),
    ).not.toThrow();
  });
});

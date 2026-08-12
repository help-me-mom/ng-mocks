import { effect, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class TargetInterceptor {
  public called = false;

  public constructor() {
    effect(() => {
      this.called = true;
    });
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14613
// Angular 17+ root effects require the framework's EffectScheduler. MockBuilder
// used to replace it with an empty class mock, so effect registration failed.
describe('issue-14613', () => {
  beforeEach(() => MockBuilder(TargetInterceptor));

  it('creates and runs an effect registered by a root service', () => {
    const target = ngMocks.findInstance(TargetInterceptor);

    TestBed.flushEffects();

    expect(target.called).toBe(true);
  });
});

import { Component, effect, Injectable } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class EffectTarget {
  public called = false;

  public constructor() {
    effect(() => {
      this.called = true;
    });
  }
}

@Component({
  selector: 'effect-host',
  template: '',
})
class EffectHostComponent {
  public constructor(public readonly target: EffectTarget) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14613
// The EffectScheduler report prompted an audit of Angular 16's predecessor,
// EffectManager, which needs a render cycle to flush effects.
describe('provider-never-mock: Angular 16 effect manager', () => {
  beforeEach(() =>
    MockBuilder(EffectHostComponent).keep(EffectTarget),
  );

  it('creates and runs an effect registered by a root service', async () => {
    const fixture = MockRender(EffectHostComponent);
    await fixture.whenStable();

    expect(fixture.point.componentInstance.target.called).toBe(true);
  });
});

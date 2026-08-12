import {
  afterNextRender,
  Component,
  Injectable,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class AfterRenderTarget {
  public called = false;

  public constructor() {
    afterNextRender(() => {
      this.called = true;
    });
  }
}

@Component({
  selector: 'after-render-host',
  template: '',
})
class AfterRenderHostComponent {
  public constructor(public readonly target: AfterRenderTarget) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14613
// The EffectScheduler report prompted an audit of the adjacent Angular root
// runtime services used by afterNextRender.
describe('provider-never-mock: Angular 16+ after-render', () => {
  beforeEach(() =>
    MockBuilder(AfterRenderHostComponent).keep(AfterRenderTarget),
  );

  it('runs a callback registered by a root service', async () => {
    const fixture = MockRender(AfterRenderHostComponent);
    await fixture.whenStable();

    expect(fixture.point.componentInstance.target.called).toBe(true);
  });
});

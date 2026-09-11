import {
  Component,
  inject,
  Injectable,
  ɵɵdefineInjectable,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

class EffectManager {
  public static constructed = 0;
  public readonly marker = { origin: 'real' };

  public constructor() {
    EffectManager.constructed += 1;
  }
}

// Angular's internal managers can have root definitions without decorators.
(EffectManager as any).ɵprov = ɵɵdefineInjectable({
  token: EffectManager,
  providedIn: 'root',
  factory: () => new EffectManager(),
});

@Injectable({ providedIn: 'root' })
class TargetService {
  public readonly manager = inject(EffectManager);
}

@Component({
  selector: 'host-provider-never-mock-runtime-global-mock',
  standalone: false,
  template: '{{ target.manager.marker.origin }}',
})
class HostComponent {
  public constructor(public readonly target: TargetService) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14896
// Explicit decisions must survive name-based runtime infrastructure preservation,
// including root classes reached only through imperative injection.
describe('provider-never-mock:runtime-global-mock', () => {
  beforeEach(() =>
    ngMocks.autoSpy(
      typeof jest === 'undefined'
        ? 'jasmine'
        : typeof (window as any).vi === 'undefined'
          ? 'jest'
          : 'vitest',
    ),
  );
  afterEach(() => ngMocks.autoSpy('reset'));

  beforeEach(() => {
    EffectManager.constructed = 0;
  });
  afterEach(() => {
    ngMocks.globalWipe(EffectManager);
    ngMocks.defaultMock(EffectManager);
  });

  it('uses the global mock for a protected root class without decorator metadata', async () => {
    const marker = { origin: 'global mock' };
    ngMocks.globalMock(EffectManager);
    ngMocks.defaultMock(EffectManager, () => ({ marker }));

    await MockBuilder([TargetService, HostComponent]);
    const fixture = MockRender(HostComponent);
    const manager = fixture.point.componentInstance.target.manager;

    expect(manager.marker).toBe(marker);
    expect(TestBed.inject(EffectManager)).toBe(manager);
    expect(EffectManager.constructed).toEqual(0);
    expect(ngMocks.formatText(fixture)).toEqual('global mock');
  });

  it('uses an explicit mock for a protected root class without decorator metadata', async () => {
    const manager = { marker: { origin: 'explicit mock' } };

    await MockBuilder([TargetService, HostComponent]).mock(
      EffectManager,
      manager,
      { precise: true },
    );
    const fixture = MockRender(HostComponent);

    expect(fixture.point.componentInstance.target.manager).toBe(
      manager,
    );
    expect(TestBed.inject(EffectManager)).toBe(manager);
    expect(EffectManager.constructed).toEqual(0);
    expect(ngMocks.formatText(fixture)).toEqual('explicit mock');
  });
});

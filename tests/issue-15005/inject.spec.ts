import { inject, Injectable } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

let constructions = 0;

@Injectable({ providedIn: 'root' })
class EventManager {
  public constructor() {
    constructions += 1;
  }

  public read(): string {
    return 'application';
  }
}

@Injectable({ providedIn: 'root' })
class TargetService {
  public readonly manager = inject(EventManager);
  public readonly repeated = inject(EventManager);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15005
describe('issue-15005:inject', () => {
  beforeEach(() => {
    constructions = 0;
  });
  afterEach(() => {
    ngMocks.globalWipe(EventManager);
    ngMocks.defaultMock(EventManager);
  });

  it('mocks and reuses a hidden application dependency with a framework name', async () => {
    await MockBuilder(TargetService);
    const target = ngMocks.get(TargetService);

    expect(ngMocks.get(TargetService)).toBe(target);
    expect(target.repeated).toBe(target.manager);
    expect(ngMocks.get(EventManager)).toBe(target.manager);
    expect(target.manager.read()).toBeUndefined();
    expect(constructions).toBe(0);
  });

  it('preserves an explicitly kept hidden dependency', async () => {
    await MockBuilder(TargetService).keep(EventManager);
    const target = ngMocks.get(TargetService);

    expect(target.repeated).toBe(target.manager);
    expect(ngMocks.get(EventManager)).toBe(target.manager);
    expect(target.manager.read()).toBe('application');
    expect(constructions).toBe(1);
  });

  it('preserves an explicitly provided hidden dependency', async () => {
    const provided = { read: () => 'provided' };
    await MockBuilder(TargetService).provide({
      provide: EventManager,
      useValue: provided,
    });
    const target = ngMocks.get(TargetService);

    expect(target.manager).toBe(provided);
    expect(target.repeated).toBe(provided);
    expect(ngMocks.get(EventManager)).toBe(provided);
    expect(target.manager.read()).toBe('provided');
    expect(constructions).toBe(0);
  });

  it('preserves the global mock decision and default for a hidden dependency', async () => {
    const configured = { read: () => 'global' };
    ngMocks.globalMock(EventManager);
    ngMocks.defaultMock(EventManager, () => configured);
    await MockBuilder(TargetService);
    const target = ngMocks.get(TargetService);

    expect(target.repeated).toBe(target.manager);
    expect(ngMocks.get(EventManager)).toBe(target.manager);
    expect(target.manager.read()).toBe('global');
    expect(constructions).toBe(0);
  });
});

import { Injectable } from '@angular/core';

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
class OrdinaryDependency {
  public read(): string {
    return 'ordinary';
  }
}

@Injectable({ providedIn: 'root' })
class TargetService {
  public constructor(
    public readonly manager: EventManager,
    public readonly ordinary: OrdinaryDependency,
  ) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15005
describe('issue-15005:root', () => {
  beforeEach(() => {
    constructions = 0;
  });

  it('mocks a root constructor dependency despite its framework name', async () => {
    await MockBuilder(TargetService);
    const target = ngMocks.get(TargetService);

    expect(ngMocks.get(TargetService)).toBe(target);
    expect(ngMocks.get(EventManager)).toBe(target.manager);
    expect(ngMocks.get(OrdinaryDependency)).toBe(target.ordinary);
    expect(target.manager.read()).toBeUndefined();
    expect(target.ordinary.read()).toBeUndefined();
    expect(constructions).toBe(0);
  });

  it('preserves an explicit keep decision for the named dependency', async () => {
    await MockBuilder(TargetService).keep(EventManager);
    const target = ngMocks.get(TargetService);

    expect(ngMocks.get(EventManager)).toBe(target.manager);
    expect(target.manager.read()).toBe('application');
    expect(target.ordinary.read()).toBeUndefined();
    expect(constructions).toBe(1);
  });

  it('preserves an explicit provider for the named dependency', async () => {
    class ProvidedService {
      public read(): string {
        return 'provided';
      }
    }
    // View Engine copies literal provider values; a class instance retains identity.
    const provided = new ProvidedService();
    await MockBuilder(TargetService).provide({
      provide: EventManager,
      useValue: provided,
    });
    const target = ngMocks.get(TargetService);

    expect(target.manager).toBe(provided);
    expect(ngMocks.get(EventManager)).toBe(provided);
    expect(target.manager.read()).toBe('provided');
    expect(target.ordinary.read()).toBeUndefined();
    expect(constructions).toBe(0);
  });
});

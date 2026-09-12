import { inject, Injectable } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class TargetDependency {
  public static constructed = 0;

  public constructor() {
    TargetDependency.constructed += 1;
  }

  public echo(): string {
    return 'real';
  }
}

@Injectable({ providedIn: 'root' })
class Implementation {
  public readonly dependency = inject(TargetDependency);
}

const CLASS_PROVIDER = {
  providedIn: 'root' as const,
  useClass: Implementation,
};

// Model compiled library metadata: JIT Injectable annotations omit provider options.
@Injectable(CLASS_PROVIDER)
class TargetService {
  public static decorators = [
    { type: Injectable, args: [CLASS_PROVIDER] },
  ];

  public readonly dependency!: TargetDependency;

  public constructor() {
    throw new Error('class token constructor');
  }
}

// The implementation's inject() dependency is absent from the token's constructor metadata.
// @see https://github.com/help-me-mom/ng-mocks/issues/14917
describe('issue-14917:inject', () => {
  beforeEach(() =>
    ngMocks.autoSpy(
      typeof jest === 'undefined'
        ? 'jasmine'
        : typeof (window as Window & { vi?: object }).vi ===
            'undefined'
          ? 'jest'
          : 'vitest',
    ),
  );
  afterEach(() => ngMocks.autoSpy('reset'));

  beforeEach(() => {
    TargetDependency.constructed = 0;
  });

  it('mocks hidden dependencies of the kept class implementation', async () => {
    await MockBuilder(TargetService);

    const service = MockRender(TargetService).point.componentInstance;

    expect(service instanceof Implementation).toBe(true);
    expect(service.dependency).toBe(ngMocks.get(TargetDependency));
    expect(TargetDependency.constructed).toBe(0);
    expect(service.dependency.echo()).toBeUndefined();
    expect(service.dependency.echo).toHaveBeenCalledTimes(1);
  });

  it('preserves an explicitly kept hidden dependency', async () => {
    await MockBuilder(TargetService).keep(TargetDependency);

    const service = MockRender(TargetService).point.componentInstance;

    expect(service instanceof Implementation).toBe(true);
    expect(service.dependency).toBe(ngMocks.get(TargetDependency));
    expect(service.dependency.echo()).toEqual('real');
    expect(TargetDependency.constructed).toBe(1);
  });

  it('preserves an explicit provider for the hidden dependency', async () => {
    const provided = { echo: () => 'provided' };
    await MockBuilder(TargetService).provide({
      provide: TargetDependency,
      useValue: provided,
    });

    const service = MockRender(TargetService).point.componentInstance;

    expect(service instanceof Implementation).toBe(true);
    expect(service.dependency).toBe(provided);
    expect(ngMocks.get(TargetDependency)).toBe(provided);
    expect(service.dependency.echo()).toEqual('provided');
    expect(TargetDependency.constructed).toBe(0);
  });
});

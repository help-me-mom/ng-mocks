import {
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  Injector,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const MISSING = new InjectionToken<string>(
  'missing-14900-get-options',
);

@Injectable({ providedIn: 'root' })
class RootDependency {
  public static constructed = 0;

  public constructor() {
    RootDependency.constructed += 1;
  }

  public echo(): string {
    return 'real';
  }
}

@Injectable()
class MissingDependency {}

@Injectable({ providedIn: 'root' })
class TargetService {
  public readonly injector = inject(Injector);
  public readonly before = this.injector.get(RootDependency, null, {
    skipSelf: true,
    optional: true,
  });
  public readonly local = inject(RootDependency);
  public readonly after = this.injector.get(RootDependency, null, {
    skipSelf: true,
    optional: true,
  });
  public readonly repeated = this.injector.get(
    RootDependency,
    undefined,
    {
      self: true,
    },
  );
  public readonly missing = this.injector.get(
    MissingDependency,
    null,
    {
      self: true,
      optional: true,
    },
  );
  public readonly fallback = this.injector.get(MISSING, 'fallback', {
    skipSelf: true,
  });
}

// Unlike inject(options), Injector.get receives the object without first
// converting its lookup options to numeric flags.
// @see https://github.com/help-me-mom/ng-mocks/issues/14900
describe('issue-14900:get-options', () => {
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
    RootDependency.constructed = 0;
  });

  describe('absent parent', () => {
    beforeEach(() => MockBuilder(TargetService));

    it('keeps parent lookups separate before and after a local mock exists', () => {
      const service =
        MockRender(TargetService).point.componentInstance;

      expect(service.before).toBeNull();
      expect(service.after).toBeNull();
      expect(service.repeated).toBe(service.local);
      expect(TestBed.inject(RootDependency)).toBe(service.local);
      expect(service.local.echo()).toBeUndefined();
      expect(service.missing).toBeNull();
      expect(service.fallback).toBe('fallback');
      expect(RootDependency.constructed).toBe(0);
    });
  });

  it('preserves an explicit parent provider and custom missing-token fallback', () => {
    const metadata = MockBuilder(TargetService).build();
    const parentValue = { echo: () => 'parent' };
    const parent = createEnvironmentInjector(
      [{ provide: RootDependency, useValue: parentValue }],
      TestBed.inject(EnvironmentInjector),
    );
    const child = createEnvironmentInjector(
      metadata.providers ?? [],
      parent,
    );

    try {
      const service = child.get(TargetService);

      expect(service.before).toBe(parentValue);
      expect(service.after).toBe(parentValue);
      expect(service.before?.echo()).toBe('parent');
      expect(service.local).not.toBe(parentValue);
      expect(service.repeated).toBe(service.local);
      expect(child.get(RootDependency)).toBe(service.local);
      expect(parent.get(RootDependency)).toBe(parentValue);
      expect(service.local.echo()).toBeUndefined();
      expect(service.missing).toBeNull();
      expect(service.fallback).toBe('fallback');
      expect(RootDependency.constructed).toBe(0);
    } finally {
      child.destroy();
      parent.destroy();
    }
  });
});

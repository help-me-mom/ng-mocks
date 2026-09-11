import {
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const MISSING = new InjectionToken<string>('missing-14900-numeric');

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
class LocalFirstService {
  public readonly local = inject(RootDependency);
  // Numeric InjectFlags.SkipSelf | InjectFlags.Optional on Angular 14-19.
  public readonly parent = inject(RootDependency, 4 | 8);
  public readonly repeated = inject(RootDependency);
  public readonly missing = inject(MISSING, 8 /* Optional */);
  public readonly missingProvider = inject(
    MissingDependency,
    8 /* Optional */,
  );
}

@Injectable({ providedIn: 'root' })
class ParentFirstService {
  // Numeric InjectFlags.SkipSelf | InjectFlags.Optional on Angular 14-19.
  public readonly parent = inject(RootDependency, 4 | 8);
  public readonly local = inject(RootDependency);
  public readonly repeated = inject(RootDependency);
  public readonly missing = inject(MISSING, 8 /* Optional */);
}

// SkipSelf must follow Angular's parent lookup before considering a runtime mock,
// including when an ordinary lookup has already cached that mock.
// @see https://github.com/help-me-mom/ng-mocks/issues/14900
describe('issue-14900:numeric', () => {
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

  describe('absent parent after a local lookup', () => {
    beforeEach(() => MockBuilder(LocalFirstService));

    it('returns null without returning the cached local mock', () => {
      const service =
        MockRender(LocalFirstService).point.componentInstance;

      expect(service.parent).toBeNull();
      expect(service.repeated).toBe(service.local);
      expect(TestBed.inject(RootDependency)).toBe(service.local);
      expect(service.local.echo()).toBeUndefined();
      expect(service.missing).toBeNull();
      expect(service.missingProvider).toBeNull();
      expect(RootDependency.constructed).toBe(0);
    });
  });

  describe('absent parent before a local lookup', () => {
    beforeEach(() => MockBuilder(ParentFirstService));

    it('returns null without creating a mock for the parent lookup', () => {
      const service = MockRender(ParentFirstService).point
        .componentInstance;

      expect(service.parent).toBeNull();
      expect(service.repeated).toBe(service.local);
      expect(TestBed.inject(RootDependency)).toBe(service.local);
      expect(service.local.echo()).toBeUndefined();
      expect(service.missing).toBeNull();
      expect(RootDependency.constructed).toBe(0);
    });
  });

  it('returns an explicit parent provider after caching a local mock', () => {
    const metadata = MockBuilder(LocalFirstService).build();
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
      const service = child.get(LocalFirstService);

      expect(service.parent).toBe(parentValue);
      expect(service.parent?.echo()).toBe('parent');
      expect(service.local).not.toBe(parentValue);
      expect(service.repeated).toBe(service.local);
      expect(child.get(RootDependency)).toBe(service.local);
      expect(parent.get(RootDependency)).toBe(parentValue);
      expect(service.local.echo()).toBeUndefined();
      expect(service.missing).toBeNull();
      expect(RootDependency.constructed).toBe(0);
    } finally {
      child.destroy();
      parent.destroy();
    }
  });

  it('returns an explicit parent provider before caching a local mock', () => {
    const metadata = MockBuilder(ParentFirstService).build();
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
      const service = child.get(ParentFirstService);

      expect(service.parent).toBe(parentValue);
      expect(service.parent?.echo()).toBe('parent');
      expect(service.local).not.toBe(parentValue);
      expect(service.repeated).toBe(service.local);
      expect(child.get(RootDependency)).toBe(service.local);
      expect(parent.get(RootDependency)).toBe(parentValue);
      expect(service.local.echo()).toBeUndefined();
      expect(service.missing).toBeNull();
      expect(RootDependency.constructed).toBe(0);
    } finally {
      child.destroy();
      parent.destroy();
    }
  });

  it('preserves an explicitly supplied local provider and optional missing tokens', async () => {
    const provided = { echo: () => 'provided' };
    await MockBuilder(LocalFirstService).provide({
      provide: RootDependency,
      useValue: provided,
    });
    const service =
      MockRender(LocalFirstService).point.componentInstance;

    expect(service.local).toBe(provided);
    expect(service.repeated).toBe(provided);
    expect(TestBed.inject(RootDependency)).toBe(provided);
    expect(service.local.echo()).toBe('provided');
    expect(service.parent).toBeNull();
    expect(service.missing).toBeNull();
    expect(service.missingProvider).toBeNull();
    expect(RootDependency.constructed).toBe(0);
  });
});

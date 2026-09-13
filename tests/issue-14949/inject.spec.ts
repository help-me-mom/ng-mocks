import { inject, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

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
  public static constructed = 0;
  public readonly dependency = inject(TargetDependency);
  public readonly repeated = inject(TargetDependency);

  public constructor() {
    Implementation.constructed += 1;
  }
}

class FactoryTarget {
  public readonly dependency!: TargetDependency;
  public readonly repeated!: TargetDependency;

  public constructor() {
    throw new Error('factory token constructor');
  }
}

let factoryCalls = 0;

// Runtime decoration keeps recipe options out of retained compiler metadata.
Injectable({
  providedIn: 'root',
  useFactory: () => {
    factoryCalls += 1;

    return {
      dependency: inject(TargetDependency),
      repeated: inject(TargetDependency),
    };
  },
})(FactoryTarget);

class ClassTarget {
  public readonly dependency!: TargetDependency;
  public readonly repeated!: TargetDependency;

  public constructor() {
    throw new Error('class token constructor');
  }
}

Injectable({
  providedIn: 'root',
  useClass: Implementation,
})(ClassTarget);

class AliasTarget {
  public readonly echo!: () => string;

  public constructor() {
    throw new Error('alias token constructor');
  }
}

Injectable({
  providedIn: 'root',
  useExisting: TargetDependency,
})(AliasTarget);

// @see https://github.com/help-me-mom/ng-mocks/issues/14949
describe('issue-14949:inject', () => {
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
    Implementation.constructed = 0;
    factoryCalls = 0;
  });

  for (const target of [FactoryTarget, ClassTarget]) {
    describe(target.name, () => {
      it('mocks hidden dependencies while resolving the kept root recipe once', async () => {
        await MockBuilder(target);

        const service = MockRender(target).point.componentInstance;

        expect(service).toBe(TestBed.inject(target));
        expect(service.dependency).toBe(
          TestBed.inject(TargetDependency),
        );
        expect(service.repeated).toBe(service.dependency);
        expect(service.dependency.echo()).toBeUndefined();
        expect(service.dependency.echo).toHaveBeenCalledTimes(1);
        expect(TargetDependency.constructed).toBe(0);
        expect(service instanceof Implementation).toBe(
          target === ClassTarget,
        );
        expect(factoryCalls).toBe(target === FactoryTarget ? 1 : 0);
        expect(Implementation.constructed).toBe(
          target === ClassTarget ? 1 : 0,
        );
      });

      it('preserves an explicitly kept hidden dependency', async () => {
        await MockBuilder(target).keep(TargetDependency);

        const service = MockRender(target).point.componentInstance;

        expect(service).toBe(TestBed.inject(target));
        expect(service.dependency).toBe(
          TestBed.inject(TargetDependency),
        );
        expect(service.repeated).toBe(service.dependency);
        expect(service.dependency.echo()).toBe('real');
        expect(TargetDependency.constructed).toBe(1);
      });

      it('preserves an explicit provider for the hidden dependency', async () => {
        const provided = { echo: () => 'provided' };
        await MockBuilder(target).provide({
          provide: TargetDependency,
          useValue: provided,
        });

        const service = MockRender(target).point.componentInstance;

        expect(service).toBe(TestBed.inject(target));
        expect(service.dependency).toBe(provided);
        expect(service.repeated).toBe(provided);
        expect(TestBed.inject(TargetDependency)).toBe(provided);
        expect(service.dependency.echo()).toBe('provided');
        expect(TargetDependency.constructed).toBe(0);
      });

      it('preserves the real root fallback for an excluded hidden dependency', async () => {
        await MockBuilder(target).exclude(TargetDependency);

        const service = MockRender(target).point.componentInstance;

        expect(service).toBe(TestBed.inject(target));
        expect(service.dependency).toBe(
          TestBed.inject(TargetDependency),
        );
        expect(service.repeated).toBe(service.dependency);
        expect(service.dependency.echo()).toBe('real');
        expect(TargetDependency.constructed).toBe(1);
      });
    });
  }

  it('preserves alias identity when its dependency is not explicitly configured', async () => {
    await MockBuilder(AliasTarget);

    const service = MockRender(AliasTarget).point.componentInstance;

    expect(service).toBe(TestBed.inject(TargetDependency));
    expect(TestBed.inject(AliasTarget)).toBe(service);
    expect(TestBed.inject(TargetDependency)).toBe(service);
  });

  it('preserves an explicit provider through the native alias recipe', async () => {
    const provided = { echo: () => 'provided alias' };
    await MockBuilder(AliasTarget).provide({
      provide: TargetDependency,
      useValue: provided,
    });

    const service = MockRender(AliasTarget).point.componentInstance;

    expect(service).toBe(provided);
    expect(TestBed.inject(AliasTarget)).toBe(provided);
    expect(TestBed.inject(TargetDependency)).toBe(provided);
    expect(service.echo()).toBe('provided alias');
    expect(TargetDependency.constructed).toBe(0);
  });
});

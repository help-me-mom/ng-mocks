import { Injectable, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/14949
describe('issue-14949', () => {
  it('keeps a JIT factory and its explicit dependencies without eagerly invoking it', async () => {
    // View Engine serializes plain provider maps, so retain a class instance.
    class Dependency {
      public readonly name: string = 'factory dependency';
    }
    const dependency = new Dependency();
    const token = new InjectionToken<typeof dependency>(
      'factory dependency',
    );
    const calls: Array<typeof dependency> = [];

    class Target {
      public readonly dependency?: typeof dependency;

      public constructor() {
        throw new Error('factory token constructor');
      }
    }

    // Runtime decoration keeps this JIT-only even in compiled spread targets.
    Injectable({
      providedIn: 'root',
      useFactory: (value: typeof dependency) => {
        calls.push(value);

        return { dependency: value };
      },
      deps: [token],
    })(Target);

    expect(
      Object.getOwnPropertyDescriptor(Target, 'decorators'),
    ).toBeUndefined();
    await MockBuilder()
      .keep(Target)
      .provide({ provide: token, useValue: dependency });

    expect(calls).toEqual([]);
    const service = ngMocks.get(Target);

    expect(service.dependency).toBe(dependency);
    expect(calls).toEqual([dependency]);
    expect(ngMocks.get(Target)).toBe(service);
    expect(calls).toEqual([dependency]);
  });

  it('keeps a JIT class implementation and its explicit dependencies', async () => {
    class Dependency {
      public readonly name: string = 'class dependency';
    }
    const dependency = new Dependency();
    const token = new InjectionToken<typeof dependency>(
      'class dependency',
    );
    const calls: Array<typeof dependency> = [];

    class Implementation {
      public constructor(
        public readonly dependency: { name: string },
      ) {
        calls.push(dependency);
      }
    }

    class Target {
      public readonly dependency?: typeof dependency;

      public constructor() {
        throw new Error('class token constructor');
      }
    }

    Injectable({
      providedIn: 'root',
      useClass: Implementation,
      deps: [token],
    })(Target);

    expect(
      Object.getOwnPropertyDescriptor(Target, 'decorators'),
    ).toBeUndefined();
    await MockBuilder()
      .keep(Target)
      .provide({ provide: token, useValue: dependency });

    expect(calls).toEqual([]);
    const service = ngMocks.get(Target);

    expect(service instanceof Implementation).toBe(true);
    expect(service.dependency).toBe(dependency);
    expect(calls).toEqual([dependency]);
    expect(ngMocks.get(Target)).toBe(service);
    expect(calls).toEqual([dependency]);
  });

  it('keeps a JIT alias pointing to the same existing instance', async () => {
    let constructions = 0;

    class Implementation {
      public readonly name: string = 'implementation';

      public constructor() {
        constructions += 1;
      }
    }
    Injectable({ providedIn: 'root' })(Implementation);

    class Target {
      public readonly name: string = 'token';

      public constructor() {
        throw new Error('existing token constructor');
      }
    }
    Injectable({
      providedIn: 'root',
      useExisting: Implementation,
    })(Target);

    expect(
      Object.getOwnPropertyDescriptor(Target, 'decorators'),
    ).toBeUndefined();
    await MockBuilder().keep(Implementation).keep(Target);

    expect(constructions).toBe(0);
    const service = ngMocks.get(Target);

    expect(service).toBe(ngMocks.get(Implementation));
    expect(service.name).toBe('implementation');
    expect(ngMocks.get(Target)).toBe(service);
    expect(constructions).toBe(1);
  });

  it('keeps the exact JIT object value', async () => {
    const value = { name: 'configured value' };

    class Target {
      public readonly name: string = 'token';

      public constructor() {
        throw new Error('value token constructor');
      }
    }
    Injectable({ providedIn: 'root', useValue: value })(Target);

    expect(
      Object.getOwnPropertyDescriptor(Target, 'decorators'),
    ).toBeUndefined();
    await MockBuilder().keep(Target);

    const service = ngMocks.get(Target);

    expect(service).toBe(value);
    expect(ngMocks.get(Target)).toBe(service);
  });

  it('keeps JIT falsy, null, and undefined values', async () => {
    for (const value of [false, 0, '', null, undefined]) {
      class Target {
        public constructor() {
          throw new Error('empty value token constructor');
        }
      }
      Injectable({ providedIn: 'root', useValue: value })(Target);

      expect(
        Object.getOwnPropertyDescriptor(Target, 'decorators'),
      ).toBeUndefined();
      await MockBuilder().keep(Target);

      const service = ngMocks.get(Target);
      if (value === undefined) {
        expect(service).toBeUndefined();
      } else if (value === null) {
        expect(service).toBeNull();
      } else {
        expect(service).toBe(value);
      }
      expect(ngMocks.get(Target)).toBe(service);
      TestBed.resetTestingModule();
    }
  });
});

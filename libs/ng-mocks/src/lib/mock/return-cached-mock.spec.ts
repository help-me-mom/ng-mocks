import { getTestBed } from '@angular/core/testing';

import CoreDefStack from '../common/core.def-stack';
import coreDefineProperty from '../common/core.define-property';
import { NG_MOCKS } from '../common/core.tokens';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockBuilderStash } from '../mock-builder/mock-builder-stash';

import returnCachedMock from './return-cached-mock';

class TargetPipe {}

class GlobalMockTargetPipe {
  public static readonly mockOf = TargetPipe;
}

class FixtureMockTargetPipe {
  public static readonly mockOf = TargetPipe;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15340
// The last fixture's NG_MOCKS maps a declaration to whatever its TestBed used:
// a mock, the kept real class, or a provider object for an injectable declaration.
// Only a mock declaration may replace the globally cached mock.
describe('return-cached-mock', () => {
  const stash = new MockBuilderStash();
  const testBed = getTestBed() as unknown as {
    _activeFixtures: unknown[];
  };
  let activeFixtures: unknown[];

  beforeEach(() => {
    stash.backup();
    activeFixtures = testBed._activeFixtures;
    testBed._activeFixtures = [];
    ngMocksUniverse.cacheDeclarations.set(
      TargetPipe,
      GlobalMockTargetPipe,
    );
  });

  afterEach(() => {
    testBed._activeFixtures = activeFixtures;
    stash.restore();
  });

  it('returns the global cached mock without an active fixture', () => {
    expect(returnCachedMock(TargetPipe)).toBe(GlobalMockTargetPipe);
  });

  it('returns the global cached mock when the fixture has no NG_MOCKS', () => {
    testBed._activeFixtures = [
      {
        debugElement: {
          injector: {
            get: (_token: unknown, notFoundValue: unknown) =>
              notFoundValue,
          },
        },
      },
    ];

    expect(returnCachedMock(TargetPipe)).toBe(GlobalMockTargetPipe);
  });

  it('returns the global cached mock when the fixture lookup fails', () => {
    testBed._activeFixtures = [
      {
        debugElement: {
          injector: {
            get: () => {
              throw new Error('destroyed injector');
            },
          },
        },
      },
    ];

    expect(returnCachedMock(TargetPipe)).toBe(GlobalMockTargetPipe);
  });

  it('returns the global cached mock when NG_MOCKS lacks the declaration', () => {
    testBed._activeFixtures = [
      {
        debugElement: {
          injector: {
            get: (token: unknown) =>
              token === NG_MOCKS ? new Map() : undefined,
          },
        },
      },
    ];

    expect(returnCachedMock(TargetPipe)).toBe(GlobalMockTargetPipe);
  });

  it('returns the global cached mock instead of a provider object', () => {
    // An injectable pipe is mapped to its mock provider in NG_MOCKS.
    const provider = {
      provide: TargetPipe,
      useClass: FixtureMockTargetPipe,
    };
    testBed._activeFixtures = [
      {
        debugElement: {
          injector: {
            get: (token: unknown) =>
              token === NG_MOCKS
                ? new Map([[TargetPipe, provider]])
                : undefined,
          },
        },
      },
    ];

    expect(returnCachedMock(TargetPipe)).toBe(GlobalMockTargetPipe);
  });

  it('returns the global cached mock instead of a kept real declaration', () => {
    // A kept declaration is mapped to itself in NG_MOCKS.
    testBed._activeFixtures = [
      {
        debugElement: {
          injector: {
            get: (token: unknown) =>
              token === NG_MOCKS
                ? new Map([[TargetPipe, TargetPipe]])
                : undefined,
          },
        },
      },
    ];

    expect(returnCachedMock(TargetPipe)).toBe(GlobalMockTargetPipe);
  });

  it('prefers the mock of the last fixture over the global cached mock', () => {
    const previousNgMocks = new Map([[TargetPipe, TargetPipe]]);
    const lastNgMocks = new Map([
      [TargetPipe, FixtureMockTargetPipe],
    ]);
    testBed._activeFixtures = [
      {
        debugElement: {
          injector: {
            get: (token: unknown) =>
              token === NG_MOCKS ? previousNgMocks : undefined,
          },
        },
      },
      {
        debugElement: {
          injector: {
            get: (token: unknown) =>
              token === NG_MOCKS ? lastNgMocks : undefined,
          },
        },
      },
    ];

    expect(returnCachedMock(TargetPipe)).toBe(FixtureMockTargetPipe);
    expect(ngMocksUniverse.cacheDeclarations.get(TargetPipe)).toBe(
      GlobalMockTargetPipe,
    );
  });

  it('merges cached resolutions into the active resolver', () => {
    class TargetModule {}
    class Dependency {}
    class MockDependency {}
    class Other {}
    const otherValue = {};

    const resolutions = new Map([[Dependency, MockDependency]]);
    coreDefineProperty(
      TargetModule,
      '__ngMocksResolutions',
      resolutions,
    );
    const resolver = new CoreDefStack();
    resolver.set(Other, otherValue);
    ngMocksUniverse.config.set('mockNgDefResolver', resolver);

    expect(returnCachedMock(TargetModule)).toBeUndefined();
    expect(resolver.get(Dependency)).toBe(MockDependency);
    expect(resolver.get(Other)).toBe(otherValue);
  });

  it('keeps cached resolutions outside of a resolver', () => {
    class TargetModule {}
    class Dependency {}
    class MockTargetModule {
      public static readonly mockOf = TargetModule;
    }

    const resolutions = new Map([[Dependency, Dependency]]);
    coreDefineProperty(
      TargetModule,
      '__ngMocksResolutions',
      resolutions,
    );
    ngMocksUniverse.cacheDeclarations.set(
      TargetModule,
      MockTargetModule,
    );

    expect(returnCachedMock(TargetModule)).toBe(MockTargetModule);
    expect(ngMocksUniverse.config.has('mockNgDefResolver')).toBe(
      false,
    );
  });
});

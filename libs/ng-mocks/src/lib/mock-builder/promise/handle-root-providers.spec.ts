import { InjectionToken } from '@angular/core';

import { NG_MOCKS_ROOT_PROVIDERS } from '../../common/core.tokens';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import handleRootProviders from './handle-root-providers';

const createInjectable = (metadata?: any) => {
  const target = () => undefined;

  if (metadata !== undefined) {
    if (metadata.providedIn !== undefined) {
      (target as any).ɵprov = {
        providedIn: metadata.providedIn,
      };
    }
    (target as any).decorators = [
      {
        args: [metadata],
        type: {
          prototype: {
            ngMetadataName: 'Injectable',
          },
        },
      },
    ];
  }

  return target;
};

const restoreMap = (target: Map<any, any>, source: Map<any, any>) => {
  target.clear();
  for (const [key, value] of source) {
    target.set(key, value);
  }
};

const restoreSet = (target: Set<any>, source: Set<any>) => {
  target.clear();
  for (const value of source) {
    target.add(value);
  }
};

describe('handle-root-providers', () => {
  let builtProviders: Map<any, any>;
  let config: Map<any, any>;
  let touches: Set<any>;

  beforeEach(() => {
    builtProviders = new Map(ngMocksUniverse.builtProviders);
    config = new Map(ngMocksUniverse.config);
    touches = new Set(ngMocksUniverse.touches);

    ngMocksUniverse.config.set('ngMocksDeps', new Set());
    ngMocksUniverse.config.set('ngMocksDepsSkip', new Set());
  });

  afterEach(() => {
    restoreMap(ngMocksUniverse.builtProviders, builtProviders);
    restoreMap(ngMocksUniverse.config, config);
    restoreSet(ngMocksUniverse.touches, touches);
  });

  const handle = (
    parameter: any,
    options?: { keepDef?: Set<any>; resolution?: any },
  ) => {
    ngMocksUniverse.config.set('ngMocksDeps', new Set([parameter]));

    const ngModule: any = {
      declarations: [],
      imports: [],
      providers: [],
    };
    const resolutionMap = new Map<any, any>();
    if (options?.resolution !== undefined) {
      resolutionMap.set(parameter, options.resolution);
    }

    handleRootProviders(
      ngModule,
      {
        keepDef: options?.keepDef ?? new Set(),
        mockDef: new Set(),
      } as any,
      {
        get: (def: any) => resolutionMap.get(def),
        has: (def: any) => resolutionMap.has(def),
        set: (def: any, value: any) => {
          resolutionMap.set(def, value);
        },
      } as any,
    );

    return ngModule.providers;
  };

  it('skips inferred parameters when root providers are explicitly kept', () => {
    const token = new InjectionToken('token');

    expect(
      handle(token, {
        keepDef: new Set([NG_MOCKS_ROOT_PROVIDERS]),
      }),
    ).toEqual([]);
  });

  it('reconstructs keep providers for root injectables with factories', () => {
    const useFactory = () => 'value';
    const target = createInjectable({
      providedIn: 'root',
      useFactory,
    });

    ngMocksUniverse.builtProviders.set(target, target);

    expect(handle(target)).toEqual([
      {
        provide: target,
        useFactory,
      },
    ]);
  });

  it('falls back to the original parameter without factory metadata', () => {
    const target = createInjectable({
      providedIn: 'root',
    });

    ngMocksUniverse.builtProviders.set(target, target);

    expect(handle(target)).toEqual([target]);
  });

  it('uses resolved providers when they differ from the parameter', () => {
    const token = new InjectionToken('token');
    const provider = {
      provide: token,
      useValue: 'value',
    };

    expect(
      handle(token, {
        resolution: provider,
      }),
    ).toEqual([provider]);
  });

  it('creates empty-array factories for multi tokens without resolved providers', () => {
    const token = new InjectionToken('token');

    ngMocksUniverse.builtProviders.set(token, null);
    ngMocksUniverse.config.set('ngMocksMulti', new Set([token]));

    expect(handle(token)).toEqual([
      jasmine.objectContaining({
        deps: jasmine.any(Array),
        provide: token,
        useFactory: jasmine.any(Function),
      }),
    ]);
    expect(handle(token)[0].useFactory()).toEqual([]);
  });

  it('creates undefined factories for non-multi injection tokens without resolved providers', () => {
    const token = new InjectionToken('token');

    ngMocksUniverse.builtProviders.set(token, null);

    expect(handle(token)).toEqual([
      jasmine.objectContaining({
        deps: jasmine.any(Array),
        provide: token,
        useFactory: jasmine.any(Function),
      }),
    ]);
    expect(handle(token)[0].useFactory()).toBeUndefined();
  });

  it('ignores unresolved non-token parameters', () => {
    const target = createInjectable({
      providedIn: 'root',
    });

    ngMocksUniverse.builtProviders.set(target, null);

    expect(handle(target)).toEqual([]);
  });
});

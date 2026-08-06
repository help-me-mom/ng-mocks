import { Injector, Provider } from '@angular/core';

import { NG_MOCKS_TOUCHES } from '../../common/core.tokens';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import createRuntimeInjectProvider from './create-runtime-inject-provider';

class TargetWithDependencies {}
class TargetWithoutDependencies {}

(TargetWithDependencies as any).ɵprov = { factory: () => undefined };
(TargetWithoutDependencies as any).ɵprov = {
  factory: () => undefined,
};

describe('create-runtime-inject-provider', () => {
  afterEach(() => {
    ngMocksUniverse.builtProviders.delete(TargetWithDependencies);
    ngMocksUniverse.builtProviders.delete(TargetWithoutDependencies);
  });

  it('preserves kept factory providers and their dependencies', () => {
    const withDependencies = {
      deps: ['dependency'],
      provide: TargetWithDependencies,
      useFactory: (dependency: string) => `with:${dependency}`,
    };
    const withoutDependencies = {
      provide: TargetWithoutDependencies,
      useFactory: () => 'without',
    };
    ngMocksUniverse.builtProviders.set(
      TargetWithDependencies,
      withDependencies,
    );
    ngMocksUniverse.builtProviders.set(
      TargetWithoutDependencies,
      withoutDependencies,
    );
    const providers: Provider[] = [
      withDependencies,
      withoutDependencies,
    ];

    createRuntimeInjectProvider(
      new Set([TargetWithDependencies, TargetWithoutDependencies]),
      new Map([
        [TargetWithDependencies, { shallow: false }],
        [TargetWithoutDependencies, { shallow: false }],
      ]),
      providers,
    );

    const destroyCallbacks: Array<() => void> = [];
    const injector = {
      get: () => undefined,
      onDestroy: (callback: () => void) =>
        destroyCallbacks.push(callback),
    };
    const withProvider = providers[0] as any;
    const withoutProvider = providers[1] as any;

    expect(withProvider.deps).toEqual([
      Injector,
      NG_MOCKS_TOUCHES,
      'dependency',
    ]);
    expect(
      withProvider.useFactory(injector, new Set(), 'value'),
    ).toBe('with:value');
    expect(withoutProvider.deps).toEqual([
      Injector,
      NG_MOCKS_TOUCHES,
    ]);
    expect(withoutProvider.useFactory(injector, new Set())).toBe(
      'without',
    );

    destroyCallbacks[0]();
  });
});

import { FactoryProvider } from '@angular/core';

import ngMocksUniverse from '../common/ng-mocks-universe';
import skipDep from '../mock-builder/promise/skip-dep';

import mockProvider from './mock-provider';

let constructorCalls = 0;
let methodCalls = 0;

class EffectManager {
  public constructor() {
    constructorCalls += 1;
  }

  public echo(): string {
    methodCalls += 1;

    return 'real';
  }
}

(EffectManager as any).ɵprov = { providedIn: 'root' };

// @see https://github.com/help-me-mom/ng-mocks/issues/14896
describe('mock-service:mock-provider', () => {
  afterEach(() => {
    ngMocksUniverse.cacheProviders.delete(EffectManager);
  });

  it('lets an explicit mock resolution override runtime infrastructure preservation', () => {
    constructorCalls = 0;
    methodCalls = 0;

    expect(mockProvider(EffectManager)).toBe(EffectManager);
    expect(skipDep(EffectManager)).toBe(true);

    spyOn(ngMocksUniverse, 'getResolution').and.returnValue('mock');

    expect(skipDep(EffectManager)).toBe(false);
    const provider = mockProvider(EffectManager) as FactoryProvider;
    const instance = provider.useFactory();

    expect(provider.provide).toBe(EffectManager);
    expect(instance instanceof EffectManager).toBe(true);
    expect(instance.echo()).toBeUndefined();
    expect(constructorCalls).toBe(0);
    expect(methodCalls).toBe(0);
  });
});

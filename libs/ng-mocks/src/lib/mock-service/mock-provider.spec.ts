import { ApplicationRef, FactoryProvider } from '@angular/core';

import coreDefineProperty from '../common/core.define-property';
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

coreDefineProperty(EffectManager, 'ɵprov', { providedIn: 'root' });

// @see https://github.com/help-me-mom/ng-mocks/issues/14896
// @see https://github.com/help-me-mom/ng-mocks/issues/15005
describe('mock-service:mock-provider', () => {
  beforeEach(() => {
    constructorCalls = 0;
    methodCalls = 0;
  });
  afterEach(() => {
    ngMocksUniverse.cacheProviders.delete(EffectManager);
    ngMocksUniverse.cacheProviders.delete(ApplicationRef);
  });

  it('automatically mocks an application provider with a framework name', () => {
    expect(skipDep(EffectManager)).toBe(false);
    const provider = mockProvider(EffectManager) as FactoryProvider;
    const instance: EffectManager = provider.useFactory();

    expect(provider.provide).toBe(EffectManager);
    expect(instance instanceof EffectManager).toBe(true);
    expect(instance.echo()).toBeUndefined();
    expect(constructorCalls).toBe(0);
    expect(methodCalls).toBe(0);
  });

  it('lets an explicit mock resolution override actual Angular provider preservation', () => {
    expect(mockProvider(ApplicationRef)).toBe(ApplicationRef);
    expect(skipDep(ApplicationRef)).toBe(true);

    spyOn(ngMocksUniverse, 'getResolution').and.returnValue('mock');

    expect(skipDep(ApplicationRef)).toBe(false);
    const provider = mockProvider(ApplicationRef) as FactoryProvider;
    const instance: ApplicationRef = provider.useFactory();

    expect(provider.provide).toBe(ApplicationRef);
    expect(instance instanceof ApplicationRef).toBe(true);
    expect(instance.tick()).toBeUndefined();
    expect(instance.tick).toHaveBeenCalledTimes(1);
  });
});

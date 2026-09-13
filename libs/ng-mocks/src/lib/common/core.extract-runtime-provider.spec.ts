import { Injector } from '@angular/core';

import coreExtractRuntimeProvider from './core.extract-runtime-provider';

let constructions = 0;

class RuntimeProvider {
  public constructor() {
    constructions += 1;
  }
}

class RuntimeManager {
  public impl: unknown = null;

  public constructor() {
    constructions += 1;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15005
describe('core.extract-runtime-provider', () => {
  beforeEach(() => {
    constructions = 0;
  });

  it('captures the exact first token before construction or registration', () => {
    let registrations = 0;
    const result = coreExtractRuntimeProvider(injector => {
      expect(injector instanceof Injector).toBe(true);
      injector.get(RuntimeProvider);
      registrations += 1;
    });

    expect(result).toBe(RuntimeProvider);
    expect(constructions).toBe(0);
    expect(registrations).toBe(0);
  });

  it('supplies an inert known manager and stops before its implementation is assigned', () => {
    let manager: RuntimeManager | undefined;
    let registrations = 0;
    const result = coreExtractRuntimeProvider(injector => {
      manager = injector.get(RuntimeManager);
      manager.impl = injector.get(RuntimeProvider);
      registrations += 1;
    }, RuntimeManager);

    expect(result).toBe(RuntimeProvider);
    expect(manager).toEqual({ impl: null });
    expect(manager instanceof RuntimeManager).toBe(false);
    expect(constructions).toBe(0);
    expect(registrations).toBe(0);
  });

  it('does not classify an unexpected request before the known manager', () => {
    expect(() =>
      coreExtractRuntimeProvider(injector => {
        injector.get(RuntimeProvider);
      }, RuntimeManager),
    ).toThrowError('Unexpected Angular after-render manager');

    expect(constructions).toBe(0);
  });

  it('preserves an unrelated native error', () => {
    const error = new Error('native registration failure');

    expect(() =>
      coreExtractRuntimeProvider(() => {
        throw error;
      }),
    ).toThrow(error);

    expect(constructions).toBe(0);
  });

  it('does not manufacture a token when a native API returns without injection', () => {
    expect(
      coreExtractRuntimeProvider(() => undefined),
    ).toBeUndefined();
    expect(constructions).toBe(0);
  });
});

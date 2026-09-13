import {
  ClassProvider,
  FactoryProvider,
  ValueProvider,
} from '@angular/core';

import CoreDefStack from '../common/core.def-stack';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockBuilderStash } from '../mock-builder/mock-builder-stash';

import resolveProvider from './helper.resolve-provider';

// @see https://github.com/help-me-mom/ng-mocks/issues/15001
describe('helper.resolve-provider', () => {
  const stash = new MockBuilderStash();

  beforeEach(() => stash.backup());
  afterEach(() => stash.restore());

  it('retains multi when a declaration already has a cached mock class', () => {
    const calls: string[] = [];
    class Target {
      public constructor() {
        calls.push('target');
      }
    }
    class MockTarget {
      public constructor() {
        calls.push('mock');
      }
    }
    const provider = Object.freeze({
      provide: Target,
      useClass: Target,
      multi: true,
    });
    const resolutions = new CoreDefStack<unknown, unknown>();
    resolutions.set(Target, MockTarget);

    const actual: ClassProvider = resolveProvider(
      provider,
      resolutions,
    );

    expect(actual).toEqual({
      provide: Target,
      useClass: MockTarget,
      multi: true,
    });
    expect(actual.useClass).toBe(MockTarget);
    expect(resolutions.get(Target)).toBe(MockTarget);
    expect(provider.useClass).toBe(Target);
    expect(calls).toEqual([]);
  });

  it('prefers a configured recipe without leaking multi into later scalar uses', () => {
    class Target {}
    class MockTarget {}
    class Dependency {}
    const factory = jasmine.createSpy('configuredFactory');
    const deps = [Dependency];
    const configured = Object.freeze({
      provide: Target,
      useFactory: factory,
      deps,
    });
    const provider = Object.freeze({
      provide: Target,
      useClass: Target,
    });
    const resolutions = new CoreDefStack<unknown, unknown>();
    resolutions.set(Target, MockTarget);
    ngMocksUniverse.builtProviders.set(Target, configured);

    const before = resolveProvider(provider, resolutions);
    const actual: FactoryProvider = resolveProvider(
      { ...provider, multi: true },
      resolutions,
    );
    const after = resolveProvider(provider, resolutions);

    expect(before).toBe(configured);
    expect(actual).not.toBe(configured);
    expect(actual.provide).toBe(Target);
    expect(actual.useFactory).toBe(factory);
    expect(actual.deps).toBe(deps);
    expect(actual.multi).toBe(true);
    expect(after).toBe(configured);
    expect('multi' in configured).toBe(false);
    expect(ngMocksUniverse.builtProviders.get(Target)).toBe(
      configured,
    );
    expect(resolutions.get(Target)).toBe(MockTarget);
    expect(factory).not.toHaveBeenCalled();
  });

  for (const value of [null, undefined]) {
    it(`retains a cached provider whose value is ${value}`, () => {
      class Target {}
      const configured = Object.freeze({
        provide: Target,
        useValue: value,
      });
      const provider = Object.freeze({
        provide: Target,
        useClass: Target,
      });
      const resolutions = new CoreDefStack<unknown, unknown>();
      resolutions.set(Target, configured);

      const actual: ValueProvider = resolveProvider(
        { ...provider, multi: true },
        resolutions,
      );

      expect(actual).not.toBe(configured);
      expect(actual.provide).toBe(Target);
      expect(actual.useValue).toBe(value);
      expect(actual.multi).toBe(true);
      expect(resolveProvider(provider, resolutions)).toBe(configured);
      expect('multi' in configured).toBe(false);
      expect(resolutions.get(Target)).toBe(configured);
    });

    it(`does not turn an omitted cached ${value} into a multi provider`, () => {
      class Target {}
      const provider = Object.freeze({
        provide: Target,
        useClass: Target,
        multi: true,
      });
      const resolutions = new CoreDefStack<unknown, unknown>();
      resolutions.set(Target, value);

      expect(resolveProvider(provider, resolutions)).toBe(value);
      expect(resolutions.has(Target)).toBe(true);
      expect(resolutions.get(Target)).toBe(value);
      expect(ngMocksUniverse.touches.has(Target)).toBe(false);
    });
  }

  it('excludes a provider before reusing its cached declaration', () => {
    class Target {}
    class MockTarget {}
    const factory = jasmine.createSpy('excludedFactory');
    const changed = jasmine.createSpy('changed');
    const provider = Object.freeze({
      provide: Target,
      useFactory: factory,
      multi: true,
    });
    const resolutions = new CoreDefStack<unknown, unknown>();
    resolutions.set(Target, MockTarget);
    ngMocksUniverse.builtProviders.set(Target, null);

    expect(
      resolveProvider(provider, resolutions, changed),
    ).toBeUndefined();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(factory).not.toHaveBeenCalled();
    expect(resolutions.get(Target)).toBe(MockTarget);
    expect(ngMocksUniverse.builtProviders.get(Target)).toBeNull();
    expect(ngMocksUniverse.touches.has(Target)).toBe(false);
  });

  it('keeps an alias to a retained target ahead of a cached resolution', () => {
    class Target {}
    class Alias {}
    class MockAlias {}
    const provider = Object.freeze({
      provide: Alias,
      useExisting: Target,
      multi: true,
    });
    const resolutions = new CoreDefStack<unknown, unknown>();
    resolutions.set(Alias, MockAlias);
    ngMocksUniverse.config.set(
      'ngMocksDepsResolution',
      new Map([[Target, 'keep']]),
    );

    expect(resolveProvider(provider, resolutions)).toBe(provider);
    expect(resolutions.get(Alias)).toBe(MockAlias);
    expect(provider.useExisting).toBe(Target);
    expect(provider.multi).toBe(true);
    expect(ngMocksUniverse.touches.has(Alias)).toBe(true);
  });
});

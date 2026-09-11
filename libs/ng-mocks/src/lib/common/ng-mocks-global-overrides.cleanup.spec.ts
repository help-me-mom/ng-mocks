import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ngMocks } from '../mock-helper/mock-helper';
import mockHelperFasterInstall from '../mock-helper/mock-helper.faster-install';

import ngMocksUniverse from './ng-mocks-universe';

import './ng-mocks-global-overrides';

@Component({
  selector: 'target',
  standalone: false,
  template: '',
})
class TargetComponent {}

@Component({
  selector: 'other',
  standalone: false,
  template: '',
})
class OtherComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14912
describe('ng-mocks-global-overrides:cleanup', () => {
  const globalKeys = [
    'builder:config',
    'builder:module',
    'builder:promise',
    'test-bed:module-options',
  ];
  let originalGlobal: Map<string, any>;
  let descriptors: Map<string, PropertyDescriptor | undefined>;
  let flush: jasmine.Spy;
  let restore: jasmine.Spy;

  beforeEach(() => {
    originalGlobal = new Map();
    for (const key of globalKeys) {
      if (ngMocksUniverse.global.has(key)) {
        originalGlobal.set(key, ngMocksUniverse.global.get(key));
      }
    }
    descriptors = new Map();
    for (const key of [
      'ngMocksOverrides',
      'ngMocksSelectors',
      'ngMocksInjectedDeclarations',
      'ngMocksMockDeclarations',
    ]) {
      descriptors.set(
        key,
        Object.getOwnPropertyDescriptor(TestBed, key),
      );
    }
    (TestBed as any).ngMocksOverrides = undefined;
    flush = spyOn(ngMocks, 'flushTestBed');
    restore = spyOn(TestBed, 'overrideComponent').and.returnValue(
      TestBed,
    );
    expect(mockHelperFasterInstall().after.length).toBe(1);
  });

  afterEach(() => {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) {
        Object.defineProperty(TestBed, key, descriptor);
      } else {
        delete (TestBed as any)[key];
      }
    }
    for (const key of globalKeys) {
      ngMocksUniverse.global.delete(key);
      if (originalGlobal.has(key)) {
        ngMocksUniverse.global.set(key, originalGlobal.get(key));
      }
    }
  });

  it('restores pending overrides and resets Angular when the preliminary flush throws', () => {
    const failure = new Error('flush failed');
    flush.and.callFake(() => {
      throw failure;
    });
    const target = { set: { template: 'original target' } };
    const other = { set: { template: 'original other' } };
    (TestBed as any).ngMocksOverrides = new Map([
      [TargetComponent, target],
      [OtherComponent, other],
    ]);
    const instance = {};
    const nativeReset = jasmine
      .createSpy('nativeReset')
      .and.returnValue(instance);
    const reset = mockHelperFasterInstall().after[0](
      nativeReset,
      instance as never,
    );
    let actual: unknown;

    try {
      reset();
    } catch (error) {
      actual = error;
    }

    expect(actual).toBe(failure);
    expect(flush).toHaveBeenCalledTimes(1);
    expect(restore.calls.allArgs()).toEqual([
      [TargetComponent, target],
      [OtherComponent, other],
    ]);
    expect((TestBed as any).ngMocksOverrides).toBeUndefined();
    expect(nativeReset).toHaveBeenCalledTimes(1);
    expect(nativeReset.calls.mostRecent()?.object).toBe(instance);
  });

  it('continues restoring later overrides and resets Angular when one restoration throws', () => {
    const failure = new Error('restoration failed');
    restore.and.callFake((declaration: any) => {
      if (declaration === TargetComponent) {
        throw failure;
      }

      return TestBed;
    });
    const target = { set: { template: 'original target' } };
    const other = { set: { template: 'original other' } };
    (TestBed as any).ngMocksOverrides = new Map([
      [TargetComponent, target],
      [OtherComponent, other],
    ]);
    const instance = {};
    const nativeReset = jasmine
      .createSpy('nativeReset')
      .and.returnValue(instance);
    const reset = mockHelperFasterInstall().after[0](
      nativeReset,
      instance as never,
    );
    let actual: unknown;

    try {
      reset();
    } catch (error) {
      actual = error;
    }

    expect(actual).toBe(failure);
    expect(flush).toHaveBeenCalledTimes(1);
    expect(restore.calls.allArgs()).toEqual([
      [TargetComponent, target],
      [OtherComponent, other],
    ]);
    expect((TestBed as any).ngMocksOverrides).toBeUndefined();
    expect(nativeReset).toHaveBeenCalledTimes(1);
  });

  for (const failure of [new Error('flush failed'), undefined]) {
    it(`preserves the first ${failure === undefined ? 'undefined' : 'Error'} failure when native reset also throws`, () => {
      flush.and.callFake(() => {
        throw failure;
      });
      const original = { set: { template: 'original target' } };
      (TestBed as any).ngMocksOverrides = new Map([
        [TargetComponent, original],
      ]);
      const nativeFailure = new Error('native reset failed');
      const nativeReset = jasmine
        .createSpy('nativeReset')
        .and.callFake(() => {
          throw nativeFailure;
        });
      const reset = mockHelperFasterInstall().after[0](
        nativeReset,
        {} as never,
      );
      let actual: unknown;
      let didThrow = false;

      try {
        reset();
      } catch (error) {
        actual = error;
        didThrow = true;
      }

      expect(didThrow).toBe(true);
      expect(actual).toBe(failure);
      expect(flush).toHaveBeenCalledTimes(1);
      expect(restore.calls.allArgs()).toEqual([
        [TargetComponent, original],
      ]);
      expect((TestBed as any).ngMocksOverrides).toBeUndefined();
      expect(nativeReset).toHaveBeenCalledTimes(1);
    });
  }

  it('propagates a native reset failure when no override cleanup fails', () => {
    const failure = new Error('native reset failed');
    const nativeReset = jasmine
      .createSpy('nativeReset')
      .and.callFake(() => {
        throw failure;
      });
    const reset = mockHelperFasterInstall().after[0](
      nativeReset,
      {} as never,
    );
    let actual: unknown;

    try {
      reset();
    } catch (error) {
      actual = error;
    }

    expect(actual).toBe(failure);
    expect(flush).not.toHaveBeenCalled();
    expect(restore).not.toHaveBeenCalled();
    expect((TestBed as any).ngMocksOverrides).toBeUndefined();
    expect(nativeReset).toHaveBeenCalledTimes(1);
  });

  it('preserves the native reset return value and receiver after successful cleanup', () => {
    const calls: string[] = [];
    flush.and.callFake(() => {
      calls.push('flush');
    });
    restore.and.callFake(() => {
      calls.push('restore');

      return TestBed;
    });
    const original = { set: { template: 'original target' } };
    (TestBed as any).ngMocksOverrides = new Map([
      [TargetComponent, original],
    ]);
    const instance = {};
    const result = {};
    const nativeReset = jasmine
      .createSpy('nativeReset')
      .and.callFake(() => {
        calls.push('reset');
        expect((TestBed as any).ngMocksOverrides).toBeUndefined();

        return result;
      });
    const reset = mockHelperFasterInstall().after[0](
      nativeReset,
      instance as never,
    );

    expect(reset()).toBe(result as never);
    expect(calls).toEqual(['flush', 'restore', 'reset']);
    expect(restore.calls.allArgs()).toEqual([
      [TargetComponent, original],
    ]);
    expect((TestBed as any).ngMocksOverrides).toBeUndefined();
    expect(nativeReset).toHaveBeenCalledTimes(1);
    expect(nativeReset.calls.mostRecent()?.object).toBe(instance);
  });
});

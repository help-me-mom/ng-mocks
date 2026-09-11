import { Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';

import funcGetGlobal from '../common/func.get-global';
import ngMocksUniverse from '../common/ng-mocks-universe';

import mockHelperFaster from './mock-helper.faster';

describe('mock-helper.faster', () => {
  const globalKeys = [
    'bullet',
    'bullet:stack',
    'bullet:stack:id',
    'bullet:customized',
    'bullet:reset',
  ];
  let originalGlobal: Map<string, any>;
  let originalTestBed: Record<string, any>;
  let beforeAllSpy: jasmine.Spy;
  let beforeEachSpy: jasmine.Spy;
  let afterEachSpy: jasmine.Spy;
  let afterAllSpy: jasmine.Spy;

  beforeEach(() => {
    originalGlobal = new Map();
    for (const key of globalKeys) {
      if (ngMocksUniverse.global.has(key)) {
        originalGlobal.set(key, ngMocksUniverse.global.get(key));
      }
      ngMocksUniverse.global.delete(key);
    }
    const testBed = getTestBed() as any;
    originalTestBed = {
      _activeFixtures: testBed._activeFixtures,
      _instantiated: testBed._instantiated,
      _moduleFactory: testBed._moduleFactory,
      _testModuleRef: testBed._testModuleRef,
    };

    // Capture the actual lifecycle closures without registering hooks inside a running spec.
    const global = funcGetGlobal();
    beforeAllSpy = spyOn(global, 'beforeAll');
    beforeEachSpy = spyOn(global, 'beforeEach');
    afterEachSpy = spyOn(global, 'afterEach');
    afterAllSpy = spyOn(global, 'afterAll');
    mockHelperFaster();
  });

  afterEach(() => {
    const testBed = getTestBed() as any;
    for (const key of Object.keys(originalTestBed)) {
      testBed[key] = originalTestBed[key];
    }
    for (const key of globalKeys) {
      ngMocksUniverse.global.delete(key);
      if (originalGlobal.has(key)) {
        ngMocksUniverse.global.set(key, originalGlobal.get(key));
      }
    }
  });

  it('removes failed per-test fixtures and preserves beforeAll fixtures', () => {
    beforeAllSpy.calls.first().args[0]();
    const idAll = ngMocksUniverse.global.get('bullet:stack:id');
    beforeEachSpy.calls.first().args[0]();
    const idEach = ngMocksUniverse.global.get('bullet:stack:id');
    const error = new Error('fixture destruction');
    const retained = {
      destroy: jasmine.createSpy('retained'),
      ngMocksStackId: idAll,
    };
    const current = {
      destroy: jasmine.createSpy('current'),
      ngMocksStackId: idEach,
    };
    const failing = {
      destroy: jasmine.createSpy('failing').and.callFake(() => {
        throw error;
      }),
      ngMocksStackId: undefined,
    };
    const activeFixtures = [retained, current, failing];
    const moduleRef = {};
    const testBed = getTestBed() as any;
    testBed._activeFixtures = activeFixtures;
    testBed._testModuleRef = moduleRef;
    spyOn(testBed, 'shouldTearDownTestingModule').and.returnValue(
      false,
    );

    let actualError: unknown;
    try {
      afterEachSpy.calls.first().args[0]();
    } catch (error_) {
      actualError = error_;
    }

    expect(actualError).toBe(error);
    expect(failing.destroy).toHaveBeenCalledTimes(1);
    expect(current.destroy).toHaveBeenCalledTimes(1);
    expect(retained.destroy).not.toHaveBeenCalled();
    expect(activeFixtures).toEqual([retained]);
    expect(current.ngMocksStackId).toBeUndefined();
    expect(testBed._testModuleRef).toBe(moduleRef);
    expect(ngMocksUniverse.global.get('bullet:stack')).toEqual([
      idAll,
    ]);
    expect(ngMocksUniverse.global.get('bullet:stack:id')).toBe(idAll);
    expect(ngMocksUniverse.global.has('bullet')).toBe(true);
  });

  it('flushes the module after the last per-test fixture fails to destroy', () => {
    beforeAllSpy.calls.first().args[0]();
    beforeEachSpy.calls.first().args[0]();
    const error = new Error('last fixture destruction');
    const failing = {
      destroy: jasmine.createSpy('failing').and.callFake(() => {
        throw error;
      }),
      ngMocksStackId: ngMocksUniverse.global.get('bullet:stack:id'),
    };
    const activeFixtures = [failing];
    const testBed = getTestBed() as any;
    testBed._activeFixtures = activeFixtures;
    testBed._instantiated = true;
    testBed._moduleFactory = {};
    testBed._testModuleRef = {};
    spyOn(testBed, 'shouldTearDownTestingModule').and.returnValue(
      false,
    );

    let actualError: unknown;
    try {
      afterEachSpy.calls.first().args[0]();
    } catch (error_) {
      actualError = error_;
    }

    expect(actualError).toBe(error);
    expect(activeFixtures).toEqual([]);
    expect(failing.destroy).toHaveBeenCalledTimes(1);
    expect(failing.ngMocksStackId).toBeUndefined();
    expect(testBed._instantiated).toBe(false);
    expect(testBed._moduleFactory).toBeUndefined();
    expect(testBed._testModuleRef).toBeNull();
    expect(ngMocksUniverse.global.has('bullet')).toBe(true);
  });

  it('preserves an undefined fixture error when module teardown also fails', () => {
    beforeAllSpy.calls.first().args[0]();
    const idAll = ngMocksUniverse.global.get('bullet:stack:id');
    beforeEachSpy.calls.first().args[0]();
    const idEach = ngMocksUniverse.global.get('bullet:stack:id');
    const current = {
      destroy: jasmine.createSpy('current'),
      ngMocksStackId: idEach,
    };
    const failing = {
      destroy: jasmine.createSpy('failing').and.callFake(() => {
        // An undefined thrown value must remain distinguishable from no error.
        throw undefined;
      }),
      ngMocksStackId: idEach,
    };
    const activeFixtures = [current, failing];
    const testBed = getTestBed() as any;
    testBed._activeFixtures = activeFixtures;
    testBed._instantiated = true;
    testBed._moduleFactory = {};
    testBed._testModuleRef = {};
    spyOn(testBed, 'shouldTearDownTestingModule').and.returnValue(
      true,
    );
    const teardown = spyOn(
      testBed,
      'tearDownTestingModule',
    ).and.throwError(new Error('module teardown'));

    let caughtError = false;
    let actualError: unknown;
    try {
      afterEachSpy.calls.first().args[0]();
    } catch (error) {
      caughtError = true;
      actualError = error;
    }
    teardown.and.stub();

    expect(caughtError).toBe(true);
    expect(actualError).toBeUndefined();
    expect(failing.destroy).toHaveBeenCalledTimes(1);
    expect(current.destroy).toHaveBeenCalledTimes(1);
    expect(teardown).toHaveBeenCalledTimes(1);
    expect(activeFixtures).toEqual([]);
    expect(failing.ngMocksStackId).toBeUndefined();
    expect(current.ngMocksStackId).toBeUndefined();
    expect(testBed._instantiated).toBe(false);
    expect(testBed._moduleFactory).toBeUndefined();
    expect(testBed._testModuleRef).toBeNull();
    expect(ngMocksUniverse.global.get('bullet:stack')).toEqual([
      idAll,
    ]);
    expect(ngMocksUniverse.global.get('bullet:stack:id')).toBe(idAll);
    expect(ngMocksUniverse.global.has('bullet')).toBe(true);
  });

  it('preserves the fixture error when the deferred reset also fails', () => {
    beforeAllSpy.calls.first().args[0]();
    const error = new Error('fixture destruction');
    const failing = {
      destroy: jasmine.createSpy('failing').and.throwError(error),
      ngMocksStackId: ngMocksUniverse.global.get('bullet:stack:id'),
    };
    const activeFixtures = [failing];
    const testBed = getTestBed() as any;
    testBed._activeFixtures = activeFixtures;
    testBed._instantiated = true;
    testBed._moduleFactory = {};
    testBed._testModuleRef = {};
    spyOn(testBed, 'shouldTearDownTestingModule').and.returnValue(
      false,
    );
    ngMocksUniverse.global.set('bullet:reset', true);
    const reset = spyOn(TestBed, 'resetTestingModule').and.throwError(
      new Error('deferred reset'),
    );

    let caughtError = false;
    let actualError: unknown;
    try {
      afterAllSpy.calls.first().args[0]();
    } catch (error_) {
      caughtError = true;
      actualError = error_;
    }
    reset.and.callThrough();

    expect(caughtError).toBe(true);
    expect(actualError).toBe(error);
    expect(failing.destroy).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(activeFixtures).toEqual([]);
    expect(failing.ngMocksStackId).toBeUndefined();
    expect(testBed._instantiated).toBe(false);
    expect(testBed._moduleFactory).toBeUndefined();
    expect(testBed._testModuleRef).toBeNull();
    expect(ngMocksUniverse.global.get('bullet:stack')).toEqual([]);
    expect(ngMocksUniverse.global.has('bullet:stack:id')).toBe(false);
    expect(ngMocksUniverse.global.has('bullet')).toBe(false);
  });

  it('propagates a deferred reset error after successful fixture cleanup', () => {
    beforeAllSpy.calls.first().args[0]();
    const current = {
      destroy: jasmine.createSpy('current'),
      ngMocksStackId: ngMocksUniverse.global.get('bullet:stack:id'),
    };
    const activeFixtures = [current];
    const testBed = getTestBed() as any;
    testBed._activeFixtures = activeFixtures;
    testBed._instantiated = true;
    testBed._moduleFactory = {};
    testBed._testModuleRef = {};
    spyOn(testBed, 'shouldTearDownTestingModule').and.returnValue(
      false,
    );
    ngMocksUniverse.global.set('bullet:reset', true);
    const error = new Error('deferred reset');
    const reset = spyOn(TestBed, 'resetTestingModule').and.throwError(
      error,
    );

    let caughtError = false;
    let actualError: unknown;
    try {
      afterAllSpy.calls.first().args[0]();
    } catch (error_) {
      caughtError = true;
      actualError = error_;
    }
    reset.and.callThrough();

    expect(caughtError).toBe(true);
    expect(actualError).toBe(error);
    expect(current.destroy).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(activeFixtures).toEqual([]);
    expect(current.ngMocksStackId).toBeUndefined();
    expect(testBed._instantiated).toBe(false);
    expect(testBed._moduleFactory).toBeUndefined();
    expect(testBed._testModuleRef).toBeNull();
    expect(ngMocksUniverse.global.get('bullet:stack')).toEqual([]);
    expect(ngMocksUniverse.global.has('bullet:stack:id')).toBe(false);
    expect(ngMocksUniverse.global.has('bullet')).toBe(false);
  });

  it('finishes the outer scope and its deferred reset when a real provider teardown throws', () => {
    const error = new Error('provider destruction');
    let destroyed = 0;
    @Injectable()
    class TargetService implements OnDestroy {
      public ngOnDestroy(): void {
        destroyed += 1;
        throw error;
      }
    }
    const token = new InjectionToken<string>('faster recovery');

    beforeAllSpy.calls.first().args[0]();
    TestBed.configureTestingModule({
      providers: [TargetService],
      teardown: { destroyAfterEach: true, rethrowErrors: true },
    });
    TestBed.inject(TargetService);
    TestBed.resetTestingModule();
    expect(ngMocksUniverse.global.has('bullet:reset')).toBe(true);
    const reset = spyOn(
      TestBed,
      'resetTestingModule',
    ).and.callThrough();

    let actualError: unknown;
    try {
      afterAllSpy.calls.first().args[0]();
    } catch (error_) {
      actualError = error_;
    }

    expect(actualError).toBe(error);
    expect(destroyed).toBe(1);
    expect(ngMocksUniverse.global.get('bullet:stack')).toEqual([]);
    expect(ngMocksUniverse.global.has('bullet:stack:id')).toBe(false);
    expect(ngMocksUniverse.global.has('bullet')).toBe(false);
    expect(ngMocksUniverse.global.has('bullet:reset')).toBe(false);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: token, useValue: 'recovered' }],
      });
      expect(TestBed.inject(token)).toEqual('recovered');
    }).not.toThrow();
  });

  it('preserves the outer faster scope when an inner scope finishes', () => {
    beforeAllSpy.calls.first().args[0]();
    const idAll = ngMocksUniverse.global.get('bullet:stack:id');
    const retained = {
      destroy: jasmine.createSpy('retained'),
      ngMocksStackId: idAll,
    };
    const activeFixtures = [retained];
    const testBed = getTestBed() as any;
    testBed._activeFixtures = activeFixtures;
    spyOn(testBed, 'shouldTearDownTestingModule').and.returnValue(
      false,
    );

    mockHelperFaster();
    beforeAllSpy.calls.mostRecent().args[0]();
    beforeEachSpy.calls.mostRecent().args[0]();
    afterEachSpy.calls.mostRecent().args[0]();
    afterAllSpy.calls.mostRecent().args[0]();

    expect(ngMocksUniverse.global.has('bullet')).toBe(true);
    expect(ngMocksUniverse.global.get('bullet:stack')).toEqual([
      idAll,
    ]);
    expect(ngMocksUniverse.global.get('bullet:stack:id')).toBe(idAll);
    expect(activeFixtures).toEqual([retained]);
    expect(retained.destroy).not.toHaveBeenCalled();

    afterAllSpy.calls.first().args[0]();
    expect(ngMocksUniverse.global.has('bullet')).toBe(false);
    expect(activeFixtures).toEqual([]);
    expect(retained.destroy).toHaveBeenCalledTimes(1);
  });
});

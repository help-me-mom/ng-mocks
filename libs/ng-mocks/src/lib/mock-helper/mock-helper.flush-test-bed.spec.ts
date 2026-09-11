import { Directive } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';

import {
  rememberInjectedDeclaration,
  rememberMockDeclarations,
  resetInjectedDeclarations,
} from '../common/ng-mocks-injected-declarations';

import flushTestBed from './mock-helper.flush-test-bed';

@Directive({
  selector: '[target]',
  standalone: false,
})
class TargetDirective {}

class MockTargetDirective {}
(MockTargetDirective as any).mockOf = TargetDirective;

// @see https://github.com/help-me-mom/ng-mocks/issues/14912
describe('mock-helper.flush-test-bed', () => {
  let testBed: any;
  let moduleFactory: object;
  let moduleRef: object;
  let originals: Array<[any, string, PropertyDescriptor | undefined]>;

  beforeEach(() => {
    testBed = getTestBed();
    originals = [];
    for (const key of [
      '_instantiated',
      '_moduleFactory',
      '_testModuleRef',
      'shouldTearDownTestingModule',
      'tearDownTestingModule',
    ]) {
      originals.push([
        testBed,
        key,
        Object.getOwnPropertyDescriptor(testBed, key),
      ]);
    }
    for (const key of [
      'ngMocksInjectedDeclarations',
      'ngMocksMockDeclarations',
    ]) {
      originals.push([
        TestBed,
        key,
        Object.getOwnPropertyDescriptor(TestBed, key),
      ]);
    }

    // Stub teardown so the live TestBed never destroys the sentinel module ref.
    testBed.shouldTearDownTestingModule = jasmine
      .createSpy('shouldTearDownTestingModule')
      .and.returnValue(true);
    testBed.tearDownTestingModule = jasmine.createSpy(
      'tearDownTestingModule',
    );
    moduleFactory = {};
    moduleRef = {};
    testBed._instantiated = true;
    testBed._moduleFactory = moduleFactory;
    testBed._testModuleRef = moduleRef;

    resetInjectedDeclarations();
    rememberMockDeclarations(
      new Map([[TargetDirective, MockTargetDirective]]),
    );
    const seed = {};
    rememberInjectedDeclaration(TargetDirective, seed);
    expect(
      (TestBed as any).ngMocksInjectedDeclarations.get(
        TargetDirective,
      ).seed,
    ).toBe(seed);
  });

  afterEach(() => {
    // Restore exact own descriptors, including fields absent in this Angular version.
    for (const [target, key, descriptor] of originals) {
      if (descriptor) {
        Object.defineProperty(target, key, descriptor);
      } else {
        delete target[key];
      }
    }
  });

  it('clears initialization and seeds when teardown throws the original error', () => {
    const failure = new Error('teardown failed');
    testBed.tearDownTestingModule.and.callFake(() => {
      expect(testBed._instantiated).toBe(true);
      expect(testBed._moduleFactory).toBe(moduleFactory);
      expect(testBed._testModuleRef).toBe(moduleRef);
      throw failure;
    });
    let caught: unknown;

    try {
      flushTestBed();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(failure);
    expect(testBed.shouldTearDownTestingModule).toHaveBeenCalledTimes(
      1,
    );
    expect(testBed.tearDownTestingModule).toHaveBeenCalledTimes(1);
    expect(testBed._instantiated).toBe(false);
    expect(testBed._moduleFactory).toBeUndefined();
    expect(testBed._testModuleRef).toBeNull();
    expect((TestBed as any).ngMocksMockDeclarations).toBeUndefined();
    expect(
      (TestBed as any).ngMocksInjectedDeclarations,
    ).toBeUndefined();
  });

  it('clears initialization and seeds when the teardown predicate throws', () => {
    const failure = new Error('teardown predicate failed');
    testBed.shouldTearDownTestingModule.and.callFake(() => {
      expect(testBed._instantiated).toBe(true);
      expect(testBed._moduleFactory).toBe(moduleFactory);
      expect(testBed._testModuleRef).toBe(moduleRef);
      throw failure;
    });
    let caught: unknown;

    try {
      flushTestBed();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(failure);
    expect(testBed.shouldTearDownTestingModule).toHaveBeenCalledTimes(
      1,
    );
    expect(testBed.tearDownTestingModule).not.toHaveBeenCalled();
    expect(testBed._instantiated).toBe(false);
    expect(testBed._moduleFactory).toBeUndefined();
    expect(testBed._testModuleRef).toBeNull();
    expect((TestBed as any).ngMocksMockDeclarations).toBeUndefined();
    expect(
      (TestBed as any).ngMocksInjectedDeclarations,
    ).toBeUndefined();
  });

  it('preserves module visibility until successful teardown finishes', () => {
    testBed.shouldTearDownTestingModule.and.callFake(() => {
      expect(testBed._instantiated).toBe(true);
      expect(testBed._moduleFactory).toBe(moduleFactory);
      expect(testBed._testModuleRef).toBe(moduleRef);

      return true;
    });
    testBed.tearDownTestingModule.and.callFake(() => {
      expect(testBed._instantiated).toBe(true);
      expect(testBed._moduleFactory).toBe(moduleFactory);
      expect(testBed._testModuleRef).toBe(moduleRef);
    });

    flushTestBed();

    expect(testBed.shouldTearDownTestingModule).toHaveBeenCalledTimes(
      1,
    );
    expect(testBed.tearDownTestingModule).toHaveBeenCalledTimes(1);
    expect(testBed._instantiated).toBe(false);
    expect(testBed._moduleFactory).toBeUndefined();
    expect(testBed._testModuleRef).toBeNull();
    expect((TestBed as any).ngMocksMockDeclarations).toBeUndefined();
    expect(
      (TestBed as any).ngMocksInjectedDeclarations,
    ).toBeUndefined();
  });

  it('clears initialization and seeds without teardown when its predicate is missing', () => {
    testBed.shouldTearDownTestingModule = undefined;

    flushTestBed();

    expect(testBed.tearDownTestingModule).not.toHaveBeenCalled();
    expect(testBed._instantiated).toBe(false);
    expect(testBed._moduleFactory).toBeUndefined();
    expect(testBed._testModuleRef).toBeNull();
    expect((TestBed as any).ngMocksMockDeclarations).toBeUndefined();
    expect(
      (TestBed as any).ngMocksInjectedDeclarations,
    ).toBeUndefined();
  });

  it('clears initialization and seeds without teardown when its predicate is false', () => {
    testBed.shouldTearDownTestingModule.and.returnValue(false);

    flushTestBed();

    expect(testBed.shouldTearDownTestingModule).toHaveBeenCalledTimes(
      1,
    );
    expect(testBed.tearDownTestingModule).not.toHaveBeenCalled();
    expect(testBed._instantiated).toBe(false);
    expect(testBed._moduleFactory).toBeUndefined();
    expect(testBed._testModuleRef).toBeNull();
    expect((TestBed as any).ngMocksMockDeclarations).toBeUndefined();
    expect(
      (TestBed as any).ngMocksInjectedDeclarations,
    ).toBeUndefined();
  });
});

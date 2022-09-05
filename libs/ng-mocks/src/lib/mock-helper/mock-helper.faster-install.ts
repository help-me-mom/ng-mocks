import { getTestBed, TestBed, TestBedStatic, TestModuleMetadata } from '@angular/core/testing';

import coreDefineProperty from '../common/core.define-property';
import ngMocksUniverse from '../common/ng-mocks-universe';

const hooks: {
  after: Array<
    (original: TestBedStatic['resetTestingModule'], instance: TestBedStatic) => TestBedStatic['resetTestingModule']
  >;
  before: Array<
    (
      original: TestBedStatic['configureTestingModule'],
      instance: TestBedStatic,
    ) => TestBedStatic['configureTestingModule']
  >;
} = ngMocksUniverse.global.get('faster-hooks') || {
  after: [],
  before: [],
};
ngMocksUniverse.global.set('faster-hooks', hooks);

const configureTestingModule =
  (
    original: TestBedStatic['configureTestingModule'],
    instance: TestBedStatic,
  ): TestBedStatic['configureTestingModule'] =>
  (moduleDef: TestModuleMetadata) => {
    if ((TestBed as any).ngMocksFasterLock) {
      return original.call(instance, moduleDef);
    }

    ngMocksUniverse.global.set('bullet:customized', true);

    let final = original;
    for (const callback of hooks.before) {
      final = callback(final, instance);
    }

    try {
      coreDefineProperty(TestBed, 'ngMocksFasterLock', true);

      return final.call(instance, moduleDef);
    } finally {
      coreDefineProperty(TestBed, 'ngMocksFasterLock', undefined);
    }
  };

const resetTestingModule =
  (original: TestBedStatic['resetTestingModule'], instance: TestBedStatic): TestBedStatic['resetTestingModule'] =>
  () => {
    if ((TestBed as any).ngMocksFasterLock) {
      return original.call(instance);
    }

    if (ngMocksUniverse.global.has('bullet')) {
      if (ngMocksUniverse.global.has('bullet:customized')) {
        ngMocksUniverse.global.set('bullet:reset', true);
      }

      return instance;
    }
    ngMocksUniverse.global.delete('bullet:customized');
    ngMocksUniverse.global.delete('bullet:reset');

    let final = original;
    for (const callback of hooks.after) {
      final = callback(final, instance);
    }

    try {
      coreDefineProperty(TestBed, 'ngMocksFasterLock', true);

      return final.call(instance);
    } finally {
      coreDefineProperty(TestBed, 'ngMocksFasterLock', undefined);
    }
  };

export default () => {
  if (!(TestBed as any).ngMocksFasterInstalled) {
    TestBed.configureTestingModule = configureTestingModule(TestBed.configureTestingModule as never, TestBed as never);
    TestBed.resetTestingModule = resetTestingModule(TestBed.resetTestingModule as never, TestBed as never);
    coreDefineProperty(TestBed, 'ngMocksFasterInstalled', true);
  }

  const testBed = getTestBed();
  if (!(testBed as any).ngMocksFasterInstalled) {
    testBed.configureTestingModule = configureTestingModule(testBed.configureTestingModule as never, testBed as never);
    testBed.resetTestingModule = resetTestingModule(testBed.resetTestingModule as never, testBed as never);
    coreDefineProperty(testBed, 'ngMocksFasterInstalled', true);
  }

  return hooks;
};

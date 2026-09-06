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

const createApplyHooks = <T>(
  original: T,
  instance: TestBedStatic,
  getHooks: () => Array<(original: T, instance: TestBedStatic) => T>,
) => {
  let applied: Array<(original: T, instance: TestBedStatic) => T> = [];
  let final = original;

  return () => {
    const callbacks = getHooks();
    let changed = callbacks.length !== applied.length;
    for (let i = 0; !changed && i < callbacks.length; i += 1) {
      changed = callbacks[i] !== applied[i];
    }
    if (changed) {
      final = original;
      for (const callback of callbacks) {
        final = callback(final, instance);
      }
      applied = [...callbacks];
    }

    return final;
  };
};

const configureTestingModule = (
  original: TestBedStatic['configureTestingModule'],
  instance: TestBedStatic,
): TestBedStatic['configureTestingModule'] => {
  const applyHooks = createApplyHooks(original, instance, () => hooks.before);

  return (moduleDef: TestModuleMetadata) => {
    if ((TestBed as any).ngMocksFasterLock) {
      return original.call(instance, moduleDef);
    }

    ngMocksUniverse.global.set('bullet:customized', true);

    const final = applyHooks();

    try {
      coreDefineProperty(TestBed, 'ngMocksFasterLock', true);

      return final.call(instance, moduleDef);
    } finally {
      coreDefineProperty(TestBed, 'ngMocksFasterLock', undefined);
    }
  };
};

const resetTestingModule = (
  original: TestBedStatic['resetTestingModule'],
  instance: TestBedStatic,
): TestBedStatic['resetTestingModule'] => {
  const applyHooks = createApplyHooks(original, instance, () => hooks.after);

  return () => {
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

    const final = applyHooks();

    try {
      coreDefineProperty(TestBed, 'ngMocksFasterLock', true);

      return final.call(instance);
    } finally {
      coreDefineProperty(TestBed, 'ngMocksFasterLock', undefined);
    }
  };
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

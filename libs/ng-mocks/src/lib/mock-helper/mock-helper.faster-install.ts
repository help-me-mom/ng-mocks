import { TestBed, TestBedStatic, TestModuleMetadata } from '@angular/core/testing';

import coreDefineProperty from '../common/core.define-property';
import ngMocksUniverse from '../common/ng-mocks-universe';

const hooks: {
  after: Array<(original: TestBedStatic['resetTestingModule']) => TestBedStatic['resetTestingModule']>;
  before: Array<(original: TestBedStatic['configureTestingModule']) => TestBedStatic['configureTestingModule']>;
} = ngMocksUniverse.global.get('faster-hooks') || {
  after: [],
  before: [],
};
ngMocksUniverse.global.set('faster-hooks', hooks);

const configureTestingModule =
  (original: TestBedStatic['configureTestingModule']): TestBedStatic['configureTestingModule'] =>
  (moduleDef: TestModuleMetadata) => {
    ngMocksUniverse.global.set('bullet:customized', true);

    let final = original;
    for (const callback of hooks.before) {
      final = callback(final);
    }

    return final.call(TestBed, moduleDef);
  };

const resetTestingModule =
  (original: TestBedStatic['resetTestingModule']): TestBedStatic['resetTestingModule'] =>
  () => {
    if (ngMocksUniverse.global.has('bullet')) {
      if (ngMocksUniverse.global.has('bullet:customized')) {
        ngMocksUniverse.global.set('bullet:reset', true);
      }

      return TestBed;
    }
    ngMocksUniverse.global.delete('bullet:customized');
    ngMocksUniverse.global.delete('bullet:reset');
    let final = original;
    for (const callback of hooks.after) {
      final = callback(final);
    }

    return final.call(TestBed);
  };

export default () => {
  if (!(TestBed as any).ngMocksFasterInstalled) {
    TestBed.configureTestingModule = configureTestingModule(TestBed.configureTestingModule);
    TestBed.resetTestingModule = resetTestingModule(TestBed.resetTestingModule);
    coreDefineProperty(TestBed, 'ngMocksFasterInstalled', true);
  }

  return hooks;
};

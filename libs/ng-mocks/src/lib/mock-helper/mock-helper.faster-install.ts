import { TestBed, TestBedStatic, TestModuleMetadata } from '@angular/core/testing';

import ngMocksUniverse from '../common/ng-mocks-universe';

const hooks: {
  after: Array<(original: TestBedStatic['resetTestingModule']) => TestBedStatic['resetTestingModule']>;
  before: Array<(original: TestBedStatic['configureTestingModule']) => TestBedStatic['configureTestingModule']>;
} = ngMocksUniverse.global.get('faster-hooks') || {
  after: [],
  before: [],
};
ngMocksUniverse.global.set('reporter-stack', hooks);

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

let needInstall = true;
export default () => {
  if (needInstall) {
    TestBed.configureTestingModule = configureTestingModule(TestBed.configureTestingModule);
    TestBed.resetTestingModule = resetTestingModule(TestBed.resetTestingModule);
    needInstall = false;
  }

  return hooks;
};

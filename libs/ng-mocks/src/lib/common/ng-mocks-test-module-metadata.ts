import { TestModuleMetadata } from '@angular/core/testing';

import ngMocksUniverse from './ng-mocks-universe';

const testModuleOptionKeys: Array<keyof TestModuleMetadata> = [
  'teardown',
  'errorOnUnknownElements',
  'errorOnUnknownProperties',
  'rethrowApplicationErrors',
  'deferBlockBehavior',
  'inferTagName',
  'animationsEnabled',
];

const testModuleOptionsKey = 'test-bed:module-options';

export const getTestModuleOptions = (): Partial<TestModuleMetadata> =>
  ngMocksUniverse.global.get(testModuleOptionsKey) ?? {};

export const rememberTestModuleOptions = (moduleDef: TestModuleMetadata): void => {
  const options: Partial<TestModuleMetadata> = {};

  for (const key of testModuleOptionKeys) {
    if (Object.prototype.hasOwnProperty.call(moduleDef, key)) {
      Object.assign(options, { [key]: moduleDef[key] });
    }
  }

  ngMocksUniverse.global.set(testModuleOptionsKey, options);
};

export const resetTestModuleOptions = (): void => {
  ngMocksUniverse.global.delete(testModuleOptionsKey);
};

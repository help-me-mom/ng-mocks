import { TestModuleMetadata } from '@angular/core/testing';

import ngMocksUniverse from './ng-mocks-universe';

const testModuleOptionsKey = 'test-bed:module-options';

export const getTestModuleOptions = (): Partial<TestModuleMetadata> =>
  ngMocksUniverse.global.get(testModuleOptionsKey) ?? {};

export const rememberTestModuleOptions = (moduleDef: TestModuleMetadata): void => {
  const options: Partial<TestModuleMetadata> = { ...moduleDef };
  delete options.declarations;
  delete options.imports;
  delete options.providers;
  delete options.schemas;

  ngMocksUniverse.global.set(testModuleOptionsKey, options);
};

export const resetTestModuleOptions = (): void => {
  ngMocksUniverse.global.delete(testModuleOptionsKey);
};

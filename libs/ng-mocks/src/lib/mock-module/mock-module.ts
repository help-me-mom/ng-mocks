import { NgModule } from '@angular/core';

import coreConfig from '../common/core.config';
import coreDefineProperty from '../common/core.define-property';
import { extendClass } from '../common/core.helpers';
import coreReflectModuleResolve from '../common/core.reflect.module-resolve';
import { AnyType, Type } from '../common/core.types';
import decorateMock from '../common/decorate.mock';
import funcGetName from '../common/func.get-name';
import funcImportExists from '../common/func.import-exists';
import { isMockNgDef } from '../common/func.is-mock-ng-def';
import { isNgDef } from '../common/func.is-ng-def';
import { isNgModuleDefWithProviders, NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { Mock } from '../common/mock';
import ngMocksUniverse from '../common/ng-mocks-universe';
import returnCachedMock from '../mock/return-cached-mock';

import mockNgDef from './mock-ng-def';

const flagMock = (resolution?: string): boolean => resolution === 'mock' && ngMocksUniverse.flags.has('skipMock');

const flagKeep = (resolution?: string): boolean => resolution === 'keep' && !ngMocksUniverse.flags.has('skipMock');

const flagReplace = (resolution?: string): boolean =>
  resolution === 'replace' && !ngMocksUniverse.flags.has('skipMock');

const flagNever = (ngModule?: any): boolean =>
  coreConfig.neverMockModule.indexOf(funcGetName(ngModule)) !== -1 && !ngMocksUniverse.flags.has('skipMock');

const preProcessFlags = (ngModule: AnyType<any>): { isRootModule: boolean; toggleSkipMockFlag: boolean } => {
  let toggleSkipMockFlag = false;
  let isRootModule = true;

  if (ngMocksUniverse.flags.has('hasRootModule')) {
    isRootModule = false;
  } else {
    ngMocksUniverse.flags.add('hasRootModule');
  }

  const resolution = ngMocksUniverse.getResolution(ngModule);
  if (flagMock(resolution)) {
    toggleSkipMockFlag = true;
    ngMocksUniverse.flags.delete('skipMock');
  }
  if (flagNever(ngModule)) {
    toggleSkipMockFlag = true;
    ngMocksUniverse.flags.add('skipMock');
  }
  if (!isRootModule && (flagKeep(resolution) || flagReplace(resolution))) {
    toggleSkipMockFlag = true;
    ngMocksUniverse.flags.add('skipMock');
  }

  return {
    isRootModule,
    toggleSkipMockFlag,
  };
};

const postProcessFlags = ({
  isRootModule,
  toggleSkipMockFlag,
}: {
  isRootModule: boolean;
  toggleSkipMockFlag: boolean;
}): void => {
  if (toggleSkipMockFlag && ngMocksUniverse.flags.has('skipMock')) {
    ngMocksUniverse.flags.delete('skipMock');
  } else if (toggleSkipMockFlag && !ngMocksUniverse.flags.has('skipMock')) {
    ngMocksUniverse.flags.add('skipMock');
  }
  if (isRootModule) {
    ngMocksUniverse.flags.delete('hasRootModule');
  }
};

const extractModuleAndProviders = (
  module: any,
): {
  ngModule: Type<any>;
  ngModuleProviders: NgModule['providers'];
} => {
  let ngModule: Type<any>;
  let ngModuleProviders: NgModule['providers'];

  if (isNgModuleDefWithProviders(module)) {
    ngModule = module.ngModule;
    if (module.providers) {
      ngModuleProviders = module.providers;
    }
  } else {
    ngModule = module;
  }

  return {
    ngModule,
    ngModuleProviders,
  };
};

const getExistingMockModule = (ngModule: Type<any>, isRootModule: boolean): Type<any> | undefined => {
  if (isMockNgDef(ngModule, 'm')) {
    return ngModule;
  }

  // Every module should be replaced with its mock copy only once to avoid errors like:
  // Failed: Type ...Component is part of the declarations of 2 modules: ...Module and ...Module...
  if (ngMocksUniverse.flags.has('cacheModule') && ngMocksUniverse.cacheDeclarations.has(ngModule)) {
    return returnCachedMock(ngModule);
  }

  // Now we check if we need to keep the original module or to replace it with some other.
  // and there is no override in its resolution.
  if (isRootModule || ngMocksUniverse.config.get('ngMocksDepsResolution')?.get(ngModule) === 'mock') {
    return undefined;
  }
  if (ngMocksUniverse.hasBuildDeclaration(ngModule)) {
    const instance = ngMocksUniverse.getBuildDeclaration(ngModule);
    if (isNgDef(instance, 'm') && instance !== ngModule) {
      return instance;
    }
  }

  return undefined;
};

const detectMockModule = (ngModule: Type<any>, mockModule?: Type<any>): Type<any> => {
  const [changed, ngModuleDef, resolutions] = mockModule
    ? [false]
    : mockNgDef(coreReflectModuleResolve(ngModule), ngModule);
  if (resolutions) {
    coreDefineProperty(ngModule, '__ngMocksResolutions', resolutions);
  }

  if (changed) {
    const parent = ngMocksUniverse.flags.has('skipMock') ? ngModule : Mock;
    const mock = extendClass(parent);

    // the last thing is to apply decorators.
    NgModule(ngModuleDef)(mock);
    decorateMock(mock, ngModule);

    return mock;
  }

  return mockModule || ngModule;
};

const getMockProviders = (ngModuleProviders: NgModule['providers']): NgModule['providers'] => {
  if (ngModuleProviders) {
    const [changed, ngModuleDef] = mockNgDef({ providers: ngModuleProviders });

    return changed ? ngModuleDef.providers : ngModuleProviders;
  }

  return undefined;
};

const generateReturn = (
  module: any,
  ngModule: AnyType<any>,
  ngModuleProviders: NgModule['providers'],
  mockModule: AnyType<any>,
  mockModuleProviders: NgModule['providers'],
): any =>
  mockModule === ngModule && mockModuleProviders === ngModuleProviders
    ? module
    : isNgModuleDefWithProviders(module)
    ? { ngModule: mockModule, ...(mockModuleProviders ? { providers: mockModuleProviders } : {}) }
    : mockModule;

/**
 * MockModule creates a mock module class out of an arbitrary module.
 * All declarations, imports, exports and providers will be mocked too.
 *
 * @see https://ng-mocks.sudo.eu/api/MockModule
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   imports: [
 *     MockModule(SharedModule),
 *   ],
 * });
 * ```
 */
export function MockModule<T>(ngModule: Type<T>): Type<T>;

/**
 * MockModule creates a mock module class with mock provides out of an arbitrary module with providers.
 * All declarations, imports, exports and providers will be mocked too.
 *
 * @see https://ng-mocks.sudo.eu/api/MockModule
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   imports: [
 *     MockModule(StoreModule.forRoot()),
 *   ],
 * });
 * ```
 */
export function MockModule<T>(ngModule: NgModuleWithProviders<T>): NgModuleWithProviders<T>;

export function MockModule(def: any): any {
  funcImportExists(def, 'MockModule');

  const { ngModule, ngModuleProviders } = extractModuleAndProviders(def);
  const flags = preProcessFlags(ngModule);
  try {
    const mockModule = detectMockModule(ngModule, getExistingMockModule(ngModule, flags.isRootModule));
    // istanbul ignore else
    if (ngMocksUniverse.flags.has('cacheModule')) {
      ngMocksUniverse.cacheDeclarations.set(ngModule, mockModule);
    }
    if (ngMocksUniverse.flags.has('skipMock')) {
      ngMocksUniverse.config.get('ngMocksDepsSkip')?.add(mockModule);
    }
    const mockModuleProviders = getMockProviders(ngModuleProviders);

    return generateReturn(def, ngModule, ngModuleProviders, mockModule, mockModuleProviders);
  } finally {
    postProcessFlags(flags);
  }
}

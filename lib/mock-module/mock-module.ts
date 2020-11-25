import { core } from '@angular/compiler';
import { NgModule, Provider } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

import coreConfig from '../common/core.config';
import { extendClass } from '../common/core.helpers';
import { ngModuleResolver } from '../common/core.reflect';
import { Type } from '../common/core.types';
import { getMockedNgDefOf } from '../common/func.get-mocked-ng-def-of';
import { isNgDef } from '../common/func.is-ng-def';
import { isNgModuleDefWithProviders, NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { Mock } from '../common/mock';
import { MockOf } from '../common/mock-of';
import ngMocksUniverse from '../common/ng-mocks-universe';

import mockNgDef from './mock-ng-def';

const preprocessToggleFlag = (ngModule: Type<any>): boolean => {
  let toggleSkipMockFlag = false;

  const resolution: undefined | 'mock' | 'keep' | 'replace' | 'exclude' = ngMocksUniverse.config
    .get('resolution')
    ?.get(ngModule);
  if (resolution === 'mock' && ngMocksUniverse.flags.has('skipMock')) {
    toggleSkipMockFlag = true;
    ngMocksUniverse.flags.delete('skipMock');
  }
  if (resolution === 'keep' && !ngMocksUniverse.flags.has('skipMock')) {
    toggleSkipMockFlag = true;
    ngMocksUniverse.flags.add('skipMock');
  }
  if (resolution === 'replace' && !ngMocksUniverse.flags.has('skipMock')) {
    toggleSkipMockFlag = true;
    ngMocksUniverse.flags.add('skipMock');
  }
  if (coreConfig.neverMockModule.indexOf(ngModule) !== -1 && !ngMocksUniverse.flags.has('skipMock')) {
    toggleSkipMockFlag = true;
    ngMocksUniverse.flags.add('skipMock');
  }

  return toggleSkipMockFlag;
};

const postprocessToggleFlag = (toggleSkipMockFlag: boolean): void => {
  if (toggleSkipMockFlag && ngMocksUniverse.flags.has('skipMock')) {
    ngMocksUniverse.flags.delete('skipMock');
  } else if (toggleSkipMockFlag && !ngMocksUniverse.flags.has('skipMock')) {
    ngMocksUniverse.flags.add('skipMock');
  }
};

const extractModuleAndProviders = (
  module: any,
): {
  ngModule: Type<any>;
  ngModuleProviders: Provider[] | undefined;
} => {
  let ngModule: Type<any>;
  let ngModuleProviders: Provider[] | undefined;

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

const getExistingMockModule = (ngModule: Type<any>): Type<any> | undefined => {
  // Every module should be replaced with its mock copy only once to avoid errors like:
  // Failed: Type ...Component is part of the declarations of 2 modules: ...Module and ...Module...
  if (ngMocksUniverse.flags.has('cacheModule') && ngMocksUniverse.cacheDeclarations.has(ngModule)) {
    return ngMocksUniverse.cacheDeclarations.get(ngModule);
  }

  // Now we check if we need to keep the original module or to replace it with some other.
  if (ngMocksUniverse.builtDeclarations.has(ngModule)) {
    const instance = ngMocksUniverse.builtDeclarations.get(ngModule);
    if (isNgDef(instance, 'm') && instance !== ngModule) {
      return instance;
    }
  }

  return undefined;
};

const getMockModuleDef = (ngModule: Type<any>, mockModule?: Type<any>): NgModule | undefined => {
  if (!mockModule) {
    let meta: core.NgModule;
    try {
      meta = ngModuleResolver.resolve(ngModule);
    } catch (e) {
      // istanbul ignore next
      throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
    }

    const [changed, ngModuleDef] = mockNgDef(meta, ngModule);
    if (changed) {
      return ngModuleDef;
    }
  }

  return undefined;
};

const detectMockModule = (ngModule: Type<any>, mockModule?: Type<any>): Type<any> => {
  const mockModuleDef = getMockModuleDef(ngModule, mockModule);

  if (mockModuleDef) {
    const parent = ngMocksUniverse.flags.has('skipMock') ? ngModule : Mock;
    const mock = extendClass(parent);

    // the last thing is to apply decorators.
    NgModule(mockModuleDef)(mock);
    MockOf(ngModule)(mock);

    return mock;
  }

  return mockModule || ngModule;
};

const getMockProviders = (ngModuleProviders: Provider[] | undefined): Provider[] | undefined => {
  if (ngModuleProviders) {
    const [changed, ngModuleDef] = mockNgDef({ providers: ngModuleProviders });

    return changed ? ngModuleDef.providers : ngModuleProviders;
  }

  return undefined;
};

const generateReturn = (
  module: any,
  ngModule: Type<any>,
  ngModuleProviders: Provider[] | undefined,
  mockModule: Type<any>,
  mockModuleProviders: Provider[] | undefined,
): any =>
  mockModule === ngModule && mockModuleProviders === ngModuleProviders
    ? module
    : isNgModuleDefWithProviders(module)
    ? { ngModule: mockModule, ...(mockModuleProviders ? { providers: mockModuleProviders } : {}) }
    : mockModule;

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-module
 */
export function MockModule<T>(module: Type<T>): Type<T>;

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-module
 */
export function MockModule<T>(module: NgModuleWithProviders<T>): NgModuleWithProviders<T>;

export function MockModule(module: any): any {
  const { ngModule, ngModuleProviders } = extractModuleAndProviders(module);

  // We are inside of an 'it'. It's fine to to return a mock copy.
  if (!ngModuleProviders && (getTestBed() as any)._instantiated) {
    try {
      return getMockedNgDefOf(ngModule, 'm');
    } catch (error) {
      // looks like an in-test mock.
    }
  }
  const toggleSkipMockFlag = preprocessToggleFlag(ngModule);
  const mockModule = detectMockModule(ngModule, getExistingMockModule(ngModule));
  // istanbul ignore else
  if (ngMocksUniverse.flags.has('cacheModule')) {
    ngMocksUniverse.cacheDeclarations.set(ngModule, mockModule);
  }
  if (ngMocksUniverse.flags.has('skipMock')) {
    ngMocksUniverse.config.get('depsSkip')?.add(mockModule);
  }
  const mockModuleProviders = getMockProviders(ngModuleProviders);
  postprocessToggleFlag(toggleSkipMockFlag);

  return generateReturn(module, ngModule, ngModuleProviders, mockModule, mockModuleProviders);
}

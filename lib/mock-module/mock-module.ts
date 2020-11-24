import { core } from '@angular/compiler';
import { NgModule, Provider } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

import coreConfig from '../common/core.config';
import { extendClass, flatten } from '../common/core.helpers';
import { ngModuleResolver } from '../common/core.reflect';
import { Type } from '../common/core.types';
import { getMockedNgDefOf } from '../common/func.get-mocked-ng-def-of';
import { isNgDef } from '../common/func.is-ng-def';
import { isNgModuleDefWithProviders, NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { Mock } from '../common/mock';
import { MockOf } from '../common/mock-of';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockPipe } from '../mock-pipe/mock-pipe';
import helperMockService from '../mock-service/helper.mock-service';

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

    const [changed, ngModuleDef] = MockNgDef(meta, ngModule);
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
    const [changed, ngModuleDef] = MockNgDef({ providers: ngModuleProviders });

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

  // We are inside of an 'it'.
  // It's fine to to return a mock copy or to throw an exception if it wasn't replaced with its mock copy in TestBed.
  if (!ngModuleProviders && (getTestBed() as any)._instantiated) {
    try {
      return getMockedNgDefOf(ngModule, 'm');
    } catch (error) {
      // looks like an in-test mock.
    }
  }
  const toggleSkipMockFlag = preprocessToggleFlag(ngModule);
  let mockModule = getExistingMockModule(ngModule);
  mockModule = detectMockModule(ngModule, mockModule);

  // We should always cache the result, in global scope it always will be a mock.
  // In MockBuilder scope it will be reset later anyway.
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

const processDef = (def: any) => {
  // First we mock modules.
  if (isNgDef(def, 'm')) {
    return MockModule(def);
  }
  if (isNgModuleDefWithProviders(def)) {
    return MockModule(def);
  }

  // Then we check decisions whether we should keep or replace a def.
  if (ngMocksUniverse.builtDeclarations.has(def)) {
    return ngMocksUniverse.builtDeclarations.get(def);
  }

  // And then we mock what we have if it wasn't blocked by the skipMock.
  if (ngMocksUniverse.flags.has('skipMock')) {
    return def;
  }
  if (isNgDef(def, 'c')) {
    return MockComponent(def);
  }
  if (isNgDef(def, 'd')) {
    return MockDirective(def);
  }
  // istanbul ignore else
  if (isNgDef(def, 'p')) {
    return MockPipe(def);
  }
};

/**
 * Can be changed at any time.
 *
 * @internal
 */
export function MockNgDef(ngModuleDef: NgModule, ngModule?: Type<any>): [boolean, NgModule] {
  let changed = !ngMocksUniverse.flags.has('skipMock');
  const mockModuleDef: NgModule = {};
  const {
    bootstrap = [],
    declarations = [],
    entryComponents = [],
    exports = [],
    imports = [],
    providers = [],
  } = ngModuleDef;

  const resolutions = new Map();

  // resolveProvider is a special case because of the def structure.
  const resolveProvider = (def: Provider) =>
    helperMockService.resolveProvider(def, resolutions, () => {
      changed = changed || true;
    });

  const resolve = (def: any) => {
    if (resolutions.has(def)) {
      return resolutions.get(def);
    }
    // skipping excluded things
    if (ngMocksUniverse.builtDeclarations.has(def) && ngMocksUniverse.builtDeclarations.get(def) === null) {
      changed = changed || true;
      resolutions.set(def, undefined);

      return;
    }
    ngMocksUniverse.touches.add(isNgModuleDefWithProviders(def) ? def.ngModule : def);

    const mockDef = processDef(def);
    if (mockDef && mockDef.ngModule && isNgModuleDefWithProviders(def)) {
      resolutions.set(def.ngModule, mockDef.ngModule);
    }
    if (ngMocksUniverse.flags.has('skipMock')) {
      ngMocksUniverse.config.get('depsSkip')?.add(mockDef);
    }

    resolutions.set(def, mockDef);
    changed = changed || mockDef !== def;

    return mockDef;
  };

  if (declarations && declarations.length) {
    mockModuleDef.declarations = flatten(declarations)
      .map(resolve)
      .filter(declaration => declaration);
  }

  if (entryComponents && entryComponents.length) {
    mockModuleDef.entryComponents = flatten(entryComponents)
      .map(resolve)
      .filter(declaration => declaration);
  }

  if (bootstrap && bootstrap.length) {
    mockModuleDef.bootstrap = flatten(bootstrap)
      .map(resolve)
      .filter(declaration => declaration);
  }

  if (providers && providers.length) {
    mockModuleDef.providers = flatten(providers)
      .map(resolveProvider)
      .filter(declaration => declaration);
  }

  // mock imports should be the latest step before exports to ensure
  // that everything has been replaced with its mock copy already
  if (imports && imports.length) {
    mockModuleDef.imports = flatten(imports)
      .map(resolve)
      .filter(declaration => declaration);
  }

  // Default exports.
  if (exports && exports.length) {
    mockModuleDef.exports = flatten(exports)
      .map(resolve)
      .filter(declaration => declaration);
  }

  // if we are in the skipMock mode we need to export only the default exports.
  // if we are in the correctModuleExports mode we need to export only default exports.
  const correctExports = ngMocksUniverse.flags.has('skipMock') || ngMocksUniverse.flags.has('correctModuleExports');

  // When we mock a module, only exported declarations are accessible inside of a test.
  // Because of that we have to export whatever a module imports or declares.
  // Unfortunately, in this case tests won't fail when a module has missed exports.
  // MockBuilder doesn't have have this issue.
  for (const def of flatten([imports, declarations])) {
    const moduleConfig = ngMocksUniverse.config.get(ngModule) || {};
    const instance = isNgModuleDefWithProviders(def) ? def.ngModule : def;
    const mockDef = resolve(instance);
    if (!mockDef) {
      continue;
    }

    // If we export a declaration, then we have to export its module too.
    const config = ngMocksUniverse.config.get(instance) || {};
    if (config.export && ngModule) {
      if (!moduleConfig.export) {
        ngMocksUniverse.config.set(ngModule, {
          ...moduleConfig,
          export: true,
        });
      }
    }

    if (correctExports && !config.export && !moduleConfig.exportAll) {
      continue;
    }
    if (mockModuleDef.exports && mockModuleDef.exports.indexOf(mockDef) !== -1) {
      continue;
    }

    changed = true;
    mockModuleDef.exports = mockModuleDef.exports || [];
    mockModuleDef.exports.push(mockDef);
  }

  return [changed, mockModuleDef];
}

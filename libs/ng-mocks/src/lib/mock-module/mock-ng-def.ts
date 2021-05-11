import { NgModule, Provider } from '@angular/core';

import { flatten } from '../common/core.helpers';
import { Type } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';
import { isNgModuleDefWithProviders } from '../common/func.is-ng-module-def-with-providers';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockPipe } from '../mock-pipe/mock-pipe';
import helperMockService from '../mock-service/helper.mock-service';

import { MockModule } from './mock-module';

const processDefMap: Array<[any, any]> = [
  ['c', MockComponent],
  ['d', MockDirective],
  ['p', MockPipe],
];

const processDef = (def: any) => {
  if (isNgDef(def, 'm') || isNgModuleDefWithProviders(def)) {
    return MockModule(def as any);
  }
  if (ngMocksUniverse.hasBuildDeclaration(def)) {
    return ngMocksUniverse.getBuildDeclaration(def);
  }
  if (ngMocksUniverse.flags.has('skipMock') && ngMocksUniverse.getResolution(def) !== 'mock') {
    return def;
  }
  for (const [flag, func] of processDefMap) {
    if (isNgDef(def, flag)) {
      return func(def);
    }
  }
};

const flatToExisting = <T, R>(data: T | T[], callback: (arg: T) => R | undefined): R[] =>
  flatten(data)
    .map(callback)
    .filter((item): item is R => !!item);

type processMeta = 'declarations' | 'entryComponents' | 'bootstrap' | 'providers' | 'imports' | 'exports';

const configureProcessMetaKeys = (
  resolve: (def: any) => any,
  resolveProvider: (def: Provider) => any,
): Array<[processMeta, (def: any) => any]> => [
  ['declarations', resolve],
  ['entryComponents', resolve],
  ['bootstrap', resolve],
  ['providers', resolveProvider],
  ['imports', resolve],
  ['exports', resolve],
];

const processMeta = (
  ngModule: NgModule,
  resolve: (def: any) => any,
  resolveProvider: (def: Provider) => any,
): NgModule => {
  const mockModuleDef: NgModule = {};
  const keys = configureProcessMetaKeys(resolve, resolveProvider);

  const cachePipe = ngMocksUniverse.flags.has('cachePipe');
  if (!cachePipe) {
    ngMocksUniverse.flags.add('cachePipe');
  }
  for (const [key, callback] of keys) {
    if (ngModule[key]?.length) {
      mockModuleDef[key] = flatToExisting(ngModule[key], callback);
    }
  }
  if (!cachePipe) {
    ngMocksUniverse.flags.delete('cachePipe');
  }

  return mockModuleDef;
};

// resolveProvider is a special case because of the def structure.
const createResolveProvider =
  (resolutions: Map<any, any>, change: () => void): ((def: Provider) => any) =>
  (def: Provider) =>
    helperMockService.resolveProvider(def, resolutions, change);

const createResolveWithProviders = (def: any, mockDef: any): boolean =>
  mockDef && mockDef.ngModule && isNgModuleDefWithProviders(def);

const createResolveExisting = (def: any, resolutions: Map<any, any>, change: (flag?: boolean) => void): any => {
  const mockDef = resolutions.get(def);
  if (def !== mockDef) {
    change();
  }

  return mockDef;
};

const createResolveExcluded = (def: any, resolutions: Map<any, any>, change: (flag?: boolean) => void): void => {
  resolutions.set(def, undefined);

  change();
};

const createResolve =
  (resolutions: Map<any, any>, change: (flag?: boolean) => void): ((def: any) => any) =>
  (def: any) => {
    if (resolutions.has(def)) {
      return createResolveExisting(def, resolutions, change);
    }

    const detectedDef = isNgModuleDefWithProviders(def) ? def.ngModule : def;
    if (ngMocksUniverse.isExcludedDef(detectedDef)) {
      return createResolveExcluded(def, resolutions, change);
    }
    ngMocksUniverse.touches.add(detectedDef);

    const mockDef = processDef(def);
    if (createResolveWithProviders(def, mockDef)) {
      resolutions.set(def.ngModule, mockDef.ngModule);
    }
    if (ngMocksUniverse.flags.has('skipMock')) {
      ngMocksUniverse.config.get('ngMocksDepsSkip')?.add(mockDef);
    }
    resolutions.set(def, mockDef);
    change(mockDef !== def);

    return mockDef;
  };

const resolveDefForExport = (
  def: any,
  resolve: (def: any) => any,
  correctExports: boolean,
  ngModule?: Type<any>,
): Type<any> | undefined => {
  const moduleConfig = ngMocksUniverse.config.get(ngModule) || {};
  const instance = isNgModuleDefWithProviders(def) ? def.ngModule : def;
  const mockDef = resolve(instance);
  if (!mockDef) {
    return undefined;
  }

  // If we export a declaration, then we have to export its module too.
  const config = ngMocksUniverse.config.get(instance);
  if (config?.export && ngModule) {
    if (!moduleConfig.export) {
      ngMocksUniverse.config.set(ngModule, {
        ...moduleConfig,
        export: true,
      });
    }
  }

  if (correctExports && !moduleConfig.exportAll && !config?.export) {
    return undefined;
  }

  return mockDef;
};

const createResolvers = (
  change: () => void,
  resolutions: Map<any, any>,
): {
  resolve: (def: any) => any;
  resolveProvider: (def: Provider) => any;
} => {
  const resolve = createResolve(resolutions, change);
  const resolveProvider = createResolveProvider(resolutions, change);

  return {
    resolve,
    resolveProvider,
  };
};

const skipAddExports = (mockDef: any, mockModuleDef: NgModule): mockDef is undefined =>
  !mockDef || (!!mockModuleDef.exports && mockModuleDef.exports.indexOf(mockDef) !== -1);

// if we are in the skipMock mode we need to export only the default exports.
// if we are in the correctModuleExports mode we need to export only default exports.
const addExports = (
  resolve: (def: any) => any,
  change: () => void,
  ngModuleDef: NgModule,
  mockModuleDef: NgModule,
  ngModule?: Type<any>,
): void => {
  const correctExports = ngMocksUniverse.flags.has('skipMock') || ngMocksUniverse.flags.has('correctModuleExports');
  for (const def of flatten([ngModuleDef.imports || [], ngModuleDef.declarations || []])) {
    const mockDef = resolveDefForExport(def, resolve, correctExports, ngModule);
    if (skipAddExports(mockDef, mockModuleDef)) {
      continue;
    }

    change();
    mockModuleDef.exports = mockModuleDef.exports || [];
    mockModuleDef.exports.push(mockDef);
  }
};

export default (ngModuleDef: NgModule, ngModule?: Type<any>): [boolean, NgModule] => {
  const hasResolver = ngMocksUniverse.config.has('mockNgDefResolver');
  if (!hasResolver) {
    ngMocksUniverse.config.set('mockNgDefResolver', new Map());
  }
  let changed = !ngMocksUniverse.flags.has('skipMock');
  const change = (flag = true) => {
    changed = changed || flag;
  };
  const { resolve, resolveProvider } = createResolvers(change, ngMocksUniverse.config.get('mockNgDefResolver'));
  const mockModuleDef = processMeta(ngModuleDef, resolve, resolveProvider);
  addExports(resolve, change, ngModuleDef, mockModuleDef, ngModule);

  if (!hasResolver) {
    ngMocksUniverse.config.delete('mockNgDefResolver');
  }

  return [changed, mockModuleDef];
};

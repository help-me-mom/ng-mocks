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
  if (ngMocksUniverse.builtDeclarations.has(def)) {
    return ngMocksUniverse.builtDeclarations.get(def);
  }
  if (ngMocksUniverse.flags.has('skipMock')) {
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

const processMeta = (
  ngModule: NgModule,
  resolve: (def: any) => any,
  resolveProvider: (def: Provider) => any,
): NgModule => {
  const mockModuleDef: NgModule = {};

  const keys: Array<[processMeta, (def: any) => any]> = [
    ['declarations', resolve],
    ['entryComponents', resolve],
    ['bootstrap', resolve],
    ['providers', resolveProvider],
    ['imports', resolve],
    ['exports', resolve],
  ];
  for (const [key, callback] of keys) {
    if (ngModule[key]?.length) {
      mockModuleDef[key] = flatToExisting(ngModule[key], callback);
    }
  }

  return mockModuleDef;
};

// resolveProvider is a special case because of the def structure.
const createResolveProvider = (resolutions: Map<any, any>, change: () => void): ((def: Provider) => any) => (
  def: Provider,
) => helperMockService.resolveProvider(def, resolutions, change);

const createResolve = (resolutions: Map<any, any>, change: (flag?: boolean) => void): ((def: any) => any) => (
  def: any,
) => {
  if (resolutions.has(def)) {
    return resolutions.get(def);
  }
  if (ngMocksUniverse.isExcludedDef(def)) {
    resolutions.set(def, undefined);

    return change();
  }
  ngMocksUniverse.touches.add(isNgModuleDefWithProviders(def) ? def.ngModule : def);

  const mockDef = processDef(def);
  if (mockDef && mockDef.ngModule && isNgModuleDefWithProviders(def)) {
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
): {
  resolve: (def: any) => any;
  resolveProvider: (def: Provider) => any;
} => {
  const resolutions = new Map();
  const resolve = createResolve(resolutions, change);
  const resolveProvider = createResolveProvider(resolutions, change);

  return {
    resolve,
    resolveProvider,
  };
};

export default (ngModuleDef: NgModule, ngModule?: Type<any>): [boolean, NgModule] => {
  let changed = !ngMocksUniverse.flags.has('skipMock');
  const change = (flag = true) => {
    changed = changed || flag;
  };
  const { resolve, resolveProvider } = createResolvers(change);
  const mockModuleDef = processMeta(ngModuleDef, resolve, resolveProvider);

  // if we are in the skipMock mode we need to export only the default exports.
  // if we are in the correctModuleExports mode we need to export only default exports.
  const correctExports = ngMocksUniverse.flags.has('skipMock') || ngMocksUniverse.flags.has('correctModuleExports');
  for (const def of flatten([ngModuleDef.imports || [], ngModuleDef.declarations || []])) {
    const mockDef = resolveDefForExport(def, resolve, correctExports, ngModule);
    if (!mockDef || (mockModuleDef.exports && mockModuleDef.exports.indexOf(mockDef) !== -1)) {
      continue;
    }

    changed = true;
    mockModuleDef.exports = mockModuleDef.exports || [];
    mockModuleDef.exports.push(mockDef);
  }

  return [changed, mockModuleDef];
};

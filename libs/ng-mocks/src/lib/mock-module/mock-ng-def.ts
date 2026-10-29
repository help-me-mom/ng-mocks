import { NgModule, Provider } from '@angular/core';

import CoreDefStack from '../common/core.def-stack';
import { flatten } from '../common/core.helpers';
import { dependencyKeys, MetadataSubstitutions, Type } from '../common/core.types';
import funcGetType from '../common/func.get-type';
import ngMocksUniverse from '../common/ng-mocks-universe';
import markExported from '../mock/mark-exported';

import createResolvers from './create-resolvers';
import markProviders from './mark-providers';

const flatToExisting = <T, R>(data: T | T[], callback: (arg: T) => R | undefined): R[] =>
  flatten(data)
    .map(callback)
    .filter((item): item is R => !!item);

const configureProcessMetaKeys = (
  resolve: (def: any) => any,
  resolveProvider: (def: Provider) => any,
): Array<[dependencyKeys, (def: any) => any]> => [
  ['declarations', resolve],
  [
    'hostDirectives',
    <T>(data: T) => {
      const def = funcGetType(data);
      const directive = resolve(def);
      return directive === def
        ? data
        : data == def
          ? directive
          : {
              ...data,
              directive,
            };
    },
  ],
  ['imports', resolve],
  ['entryComponents', resolve],
  ['bootstrap', resolve],
  ['providers', resolveProvider],
  ['viewProviders', resolveProvider],
  ['exports', resolve],
  ['schemas', v => v],
];

const processMeta = <
  T extends Partial<Record<dependencyKeys, any>> & {
    skipMarkProviders?: boolean;
  },
>(
  ngModule: T,
  resolve: (def: any) => any,
  resolveProvider: (def: Provider) => any,
  substitutions: MetadataSubstitutions,
): Partial<T> => {
  const mockModuleDef: Partial<T> = {};
  const keys = configureProcessMetaKeys(resolve, resolveProvider);

  const cachePipe = ngMocksUniverse.flags.has('cachePipe');
  if (!cachePipe) {
    ngMocksUniverse.flags.add('cachePipe');
  }
  try {
    for (const [key, callback] of keys) {
      if (ngModule[key]?.length) {
        const originals: unknown[] = ngModule[key];
        const entries: Array<[unknown, unknown]> = [];
        mockModuleDef[key] = flatToExisting(originals, entry => {
          const value = callback(entry);
          entries.push([entry, value]);

          return value;
        });
        let index = 0;
        substitutions[key] = originals.map(original => {
          const count = flatten(original).length;
          const contribution = { original, entries: entries.slice(index, index + count) };
          index += count;

          return contribution;
        });
      }
    }
    if (!ngModule.skipMarkProviders) {
      markProviders(mockModuleDef.providers);
      markProviders(mockModuleDef.viewProviders);
    }

    return mockModuleDef;
  } finally {
    if (!cachePipe) {
      ngMocksUniverse.flags.delete('cachePipe');
    }
  }
};

const resolveDefForExport = (
  def: any,
  resolve: (def: any) => any,
  correctExports: boolean,
  ngModule?: Type<any>,
): Type<any> | undefined => {
  const moduleConfig = ngMocksUniverse.config.get(ngModule) || {};
  const instance = funcGetType(def);
  const mockDef = resolve(instance);
  if (!mockDef) {
    return undefined;
  }

  // If we export a declaration, then we have to export its module too.
  const config = ngMocksUniverse.config.get(instance);
  if (config?.export && ngModule && !moduleConfig.export) {
    ngMocksUniverse.config.set(ngModule, {
      ...moduleConfig,
      export: true,
    });
  }

  if (correctExports && !moduleConfig.exportAll && !config?.export) {
    return undefined;
  }

  markExported(instance, ngModule);

  return mockDef;
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
  substitutions: MetadataSubstitutions,
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
    const original = funcGetType(def);
    substitutions.exports = substitutions.exports || [];
    substitutions.exports.push({ original, entries: [[original, mockDef]] });
  }
};

export default <
  T extends NgModule & {
    hostDirectives?: Array<any>;
    skipMarkProviders?: boolean;
    skipExports?: boolean;
  },
>(
  ngModuleDef: T,
  ngModule?: Type<any>,
): [boolean, Partial<T>, Map<any, any>, MetadataSubstitutions] => {
  const hasResolver = ngMocksUniverse.config.has('mockNgDefResolver');
  if (!hasResolver) {
    ngMocksUniverse.config.set('mockNgDefResolver', new CoreDefStack());
  }
  const resolver: CoreDefStack<any, any> = ngMocksUniverse.config.get('mockNgDefResolver');
  resolver.push();

  let changed = !ngMocksUniverse.flags.has('skipMock');
  const change = (flag = true) => {
    changed = changed || flag;
  };
  let mockModuleDef: Partial<T>;
  let resolutions: Map<any, any>;
  const substitutions: MetadataSubstitutions = {};
  try {
    const { resolve, resolveProvider } = createResolvers(change, resolver);
    mockModuleDef = processMeta(ngModuleDef, resolve, resolveProvider, substitutions);
    if (!ngModuleDef.skipExports) {
      addExports(resolve, change, ngModuleDef, mockModuleDef, substitutions, ngModule);
    }
    for (const def of ngModule && mockModuleDef.exports ? (flatten(mockModuleDef.exports) as Array<any>) : []) {
      markExported(def, ngModule);
    }
  } finally {
    resolutions = resolver.pop();
    if (!hasResolver) {
      ngMocksUniverse.config.delete('mockNgDefResolver');
    }
  }

  return [changed, mockModuleDef, resolutions, substitutions];
};

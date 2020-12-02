import { InjectionToken } from '@angular/core';

import coreConfig from './core.config';
import { AnyType } from './core.types';

// istanbul ignore next
const getGlobal = (): any => window || global;

interface NgMocksUniverse {
  builtDeclarations: Map<any, any>;
  builtProviders: Map<any, any>;
  cacheDeclarations: Map<any, any>;
  cacheProviders: Map<any, any>;
  config: Map<any, any>;
  flags: Set<string>;
  getOverrides: () => Map<any, any>;
  global: Map<any, any>;
  isExcludedDef: (def: any) => boolean;
  isProvidedDef: (def: any) => boolean;
  touches: Set<AnyType<any> | InjectionToken<any> | string>;
}

getGlobal().ngMocksUniverse = getGlobal().ngMocksUniverse || {};
const ngMocksUniverse = getGlobal().ngMocksUniverse;

ngMocksUniverse.builtDeclarations = new Map();
ngMocksUniverse.builtProviders = new Map();
ngMocksUniverse.cacheDeclarations = new Map();
ngMocksUniverse.cacheProviders = new Map();
ngMocksUniverse.config = new Map();
ngMocksUniverse.flags = new Set(coreConfig.flags);
ngMocksUniverse.global = new Map();
ngMocksUniverse.touches = new Set();

ngMocksUniverse.getOverrides = (): Map<any, any> => {
  if (!ngMocksUniverse.global.has('overrides')) {
    ngMocksUniverse.global.set('overrides', new Map());
  }

  return ngMocksUniverse.global.get('overrides');
};

const hasBuildDeclaration = (def: any): boolean => ngMocksUniverse.builtDeclarations.has(def);
const getBuildDeclaration = (def: any): any => ngMocksUniverse.builtDeclarations.get(def);

ngMocksUniverse.isExcludedDef = (def: any): boolean => hasBuildDeclaration(def) && getBuildDeclaration(def) === null;

ngMocksUniverse.isProvidedDef = (def: any): boolean => hasBuildDeclaration(def) && getBuildDeclaration(def) !== null;

export default ((): NgMocksUniverse => ngMocksUniverse)();

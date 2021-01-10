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
  configInstance: Map<any, any>;
  flags: Set<string>;
  getBuildDeclaration: (def: any) => any | undefined;
  getDefaults: () => Map<any, any>;
  getLocalMocks: () => Array<[any, any]>;
  getOverrides: () => Map<any, any>;
  getResolution: (def: any) => undefined | 'mock' | 'keep' | 'replace' | 'exclude';
  global: Map<any, any>;
  hasBuildDeclaration: (def: any) => boolean;
  isExcludedDef: (def: any) => boolean;
  isProvidedDef: (def: any) => boolean;
  touches: Set<AnyType<any> | InjectionToken<any> | string>;
}

getGlobal().ngMocksUniverse = getGlobal().ngMocksUniverse || {};
const ngMocksUniverse: NgMocksUniverse = getGlobal().ngMocksUniverse;

ngMocksUniverse.builtDeclarations = new Map();
ngMocksUniverse.builtProviders = new Map();
ngMocksUniverse.cacheDeclarations = new Map();
ngMocksUniverse.cacheProviders = new Map();
ngMocksUniverse.config = new Map();
ngMocksUniverse.configInstance = new Map();
ngMocksUniverse.flags = new Set(coreConfig.flags);
ngMocksUniverse.global = new Map();
ngMocksUniverse.touches = new Set();

ngMocksUniverse.getLocalMocks = () => {
  if (!ngMocksUniverse.global.has('local-mocks')) {
    ngMocksUniverse.global.set('local-mocks', []);
  }

  return ngMocksUniverse.global.get('local-mocks');
};

ngMocksUniverse.getOverrides = () => {
  if (!ngMocksUniverse.global.has('overrides')) {
    ngMocksUniverse.global.set('overrides', new Map());
  }

  return ngMocksUniverse.global.get('overrides');
};

ngMocksUniverse.getDefaults = () => {
  if (!ngMocksUniverse.global.has('defaults')) {
    ngMocksUniverse.global.set('defaults', new Map());
  }

  return ngMocksUniverse.global.get('defaults');
};

ngMocksUniverse.getResolution = (def: any) => {
  const set = ngMocksUniverse.config.get('ngMocksDepsResolution');
  if (set?.has(def)) {
    return set.get(def);
  }

  if (!ngMocksUniverse.getDefaults().has(def)) {
    return undefined;
  }

  const value = ngMocksUniverse.getDefaults().get(def);
  if (!value) {
    return 'exclude';
  }
  if (def === value) {
    return 'keep';
  }

  return 'replace';
};

ngMocksUniverse.getBuildDeclaration = (def: any) => {
  if (ngMocksUniverse.builtDeclarations.has(def)) {
    return ngMocksUniverse.builtDeclarations.get(def);
  }
  if (ngMocksUniverse.getDefaults().has(def)) {
    return ngMocksUniverse.getDefaults().get(def);
  }
};

ngMocksUniverse.hasBuildDeclaration = (def: any) => {
  if (ngMocksUniverse.builtDeclarations.has(def)) {
    return true;
  }
  if (ngMocksUniverse.getDefaults().has(def)) {
    return true;
  }

  return false;
};

const hasBuildDeclaration = (def: any): boolean => ngMocksUniverse.hasBuildDeclaration(def);
const getBuildDeclaration = (def: any): any => ngMocksUniverse.getBuildDeclaration(def);

ngMocksUniverse.isExcludedDef = (def: any): boolean => hasBuildDeclaration(def) && getBuildDeclaration(def) === null;

ngMocksUniverse.isProvidedDef = (def: any): boolean => hasBuildDeclaration(def) && getBuildDeclaration(def) !== null;

export default ((): NgMocksUniverse => ngMocksUniverse)();

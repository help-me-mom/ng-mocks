import { IMockBuilderConfig } from '../mock-builder/types';

import coreConfig from './core.config';
import { AnyDeclaration } from './core.types';
import funcGetGlobal from './func.get-global';
import funcGetName from './func.get-name';

const globalMap = (key: string) => () => {
  if (!ngMocksUniverse.global.has(key)) {
    ngMocksUniverse.global.set(key, new Map());
  }

  return ngMocksUniverse.global.get(key);
};

interface NgMocksUniverse {
  builtDeclarations: Map<any, any>;
  builtProviders: Map<any, any>;
  cacheDeclarations: Map<any, any>;
  cacheProviders: Map<any, any>;
  config: Map<any, any>;
  configInstance: Map<any, any>;
  flags: Set<string>;
  getBuildDeclaration: (def: any) => any | undefined;
  getConfigMock: () => Map<any, IMockBuilderConfig>;
  getDefaults: () => Map<any, ['mock' | 'keep' | 'replace' | 'exclude', any?]>;
  getLocalMocks: () => Array<[any, any]>;
  getOverrides: () => Map<any, any>;
  getResolution: (def: any) => undefined | 'mock' | 'keep' | 'replace' | 'exclude';
  global: Map<any, any>;
  hasBuildDeclaration: (def: any) => boolean;
  isExcludedDef: (def: any) => boolean;
  isProvidedDef: (def: any) => boolean;
  touches: Set<AnyDeclaration<any> | string>;
  indexValue: number;
  index: () => number;
}

funcGetGlobal().ngMocksUniverse = funcGetGlobal().ngMocksUniverse || {};
const ngMocksUniverse: NgMocksUniverse = funcGetGlobal().ngMocksUniverse;

ngMocksUniverse.builtDeclarations = new Map();
ngMocksUniverse.builtProviders = new Map();
ngMocksUniverse.cacheDeclarations = new Map();
ngMocksUniverse.cacheProviders = new Map();
ngMocksUniverse.config = new Map();
ngMocksUniverse.configInstance = new Map();
ngMocksUniverse.flags = new Set(coreConfig.flags);
ngMocksUniverse.global = new Map();
ngMocksUniverse.touches = new Set();

ngMocksUniverse.global.set('flags', {
  // @deprecated and will be changed in A13 to 'throw'
  onMockBuilderMissingDependency: coreConfig.onMockBuilderMissingDependency,
  // @deprecated and will be changed in A13 to 'throw'
  onMockInstanceRestoreNeed: coreConfig.onMockInstanceRestoreNeed,
  // @deprecated and will be changed in A13 to 'throw'
  onTestBedFlushNeed: coreConfig.onTestBedFlushNeed,
});

ngMocksUniverse.getOverrides = globalMap('overrides');
ngMocksUniverse.getDefaults = globalMap('defaults');
ngMocksUniverse.getConfigMock = globalMap('configMock');

const getDefaults = (def: any): [] | ['mock' | 'keep' | 'replace' | 'exclude', any?] => {
  {
    const defValue = ngMocksUniverse.getDefaults().get(def);
    if (defValue) {
      return defValue;
    }
  }

  {
    const defValue = typeof def === 'function' ? ngMocksUniverse.getDefaults().get(`@${funcGetName(def)}`) : undefined;
    if (defValue) {
      return defValue;
    }
  }

  return [];
};

ngMocksUniverse.getResolution = (def: any): undefined | 'mock' | 'keep' | 'replace' | 'exclude' => {
  const set = ngMocksUniverse.config.get('ngMocksDepsResolution');
  if (set?.has(def)) {
    return set.get(def);
  }
  const [value] = getDefaults(def);

  return value;
};

ngMocksUniverse.getBuildDeclaration = (def: any): undefined | null | any => {
  if (ngMocksUniverse.builtDeclarations.has(def)) {
    return ngMocksUniverse.builtDeclarations.get(def);
  }
  const [mode, replacement] = getDefaults(def);

  if (mode === 'exclude') {
    return null;
  }
  if (mode === 'keep') {
    return def;
  }
  if (mode === 'replace') {
    return replacement;
  }
};

ngMocksUniverse.hasBuildDeclaration = (def: any): boolean => {
  if (ngMocksUniverse.builtDeclarations.has(def)) {
    return true;
  }
  const [mode] = getDefaults(def);

  return !!mode && mode !== 'mock';
};

const hasBuildDeclaration = (def: any): boolean => ngMocksUniverse.hasBuildDeclaration(def);
const getBuildDeclaration = (def: any): any => ngMocksUniverse.getBuildDeclaration(def);

ngMocksUniverse.isExcludedDef = (def: any): boolean => {
  const resolution = ngMocksUniverse.getResolution(def);
  if (resolution && resolution !== 'exclude') {
    return false;
  }

  return hasBuildDeclaration(def) && getBuildDeclaration(def) === null;
};

ngMocksUniverse.isProvidedDef = (def: any): boolean => hasBuildDeclaration(def) && getBuildDeclaration(def) !== null;

// excluding StoreDevtoolsModule by default
ngMocksUniverse.getDefaults().set('@StoreDevtoolsModule', ['exclude']);

ngMocksUniverse.indexValue = 0;
ngMocksUniverse.index = () => {
  return ngMocksUniverse.indexValue++;
};

export default ((): NgMocksUniverse => ngMocksUniverse)();

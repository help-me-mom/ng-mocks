import { InjectionToken, NgModule } from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { Type } from 'ng-mocks';

import { flatten, mapEntries, mapKeys, mapValues } from '../common/core.helpers';
import ngMocksUniverse from '../common/ng-mocks-universe';

import { MockBuilderPromise } from './mock-builder-promise';
import { IMockBuilderResult } from './types';

const requiredMetadata = (
  ngModule: TestModuleMetadata,
): {
  declarations: any[];
  imports: any[];
  providers: any[];
} => ({
  declarations: [...(ngModule.declarations || /* istanbul ignore next */ [])],
  imports: [...(ngModule.imports || /* istanbul ignore next */ [])],
  providers: [...(ngModule.providers || /* istanbul ignore next */ [])],
});

const getEmptyConfig = () => ({
  beforeCC: new Set(),
  configDef: new Map(),
  defProviders: new Map(),
  defValue: new Map(),
  excludeDef: new Set(),
  keepDef: new Set(),
  mockDef: new Set(),
  providerDef: new Map(),
  replaceDef: new Set(),
});

const addValuesToSet = (source: Set<any>, destination: Set<any>): void => {
  for (const value of mapValues(source)) {
    destination.add(value);
  }
};

const addEntitiesToMap = (source: Map<any, any>, destination: Map<any, any>): void => {
  for (const [key, value] of mapEntries(source)) {
    destination.set(key, value);
  }
};

const areEqualSets = (source: Set<any>, destination: Set<any>): boolean => {
  if (!destination || destination.size !== source.size) {
    return false;
  }
  for (const value of mapValues(source)) {
    if (!destination.has(value)) {
      return false;
    }
  }

  return true;
};

const areEqualMaps = (source: Map<any, any>, destination: Map<any, any>): boolean => {
  if (!destination || destination.size !== source.size) {
    return false;
  }
  for (const value of mapKeys(source)) {
    if (!destination.has(value)) {
      return false;
    }
    if (destination.get(value) !== source.get(value)) {
      return false;
    }
  }

  return true;
};

const areEqualProviderDefs = (thisDef: any, prototypeDef: any, ...keys: string[]) => {
  for (const key of keys) {
    if (prototypeDef && thisDef && prototypeDef[key] && thisDef[key] && prototypeDef[key] === thisDef[key]) {
      return true;
    }
  }

  return prototypeDef === thisDef;
};

const areEqualProviders = (prototype: any, source: any): boolean => {
  // a case of multi vs non-multi
  if (Array.isArray(prototype) !== Array.isArray(source)) {
    return false;
  }

  const [prototypeDefs, thisDefs] = [flatten(prototype), flatten(source)];
  if (prototypeDefs.length !== thisDefs.length) {
    return false;
  }

  for (let index = 0; index < prototypeDefs.length; index += 1) {
    const [prototypeDef, thisDef] = [prototypeDefs[index], thisDefs[index]];

    if (prototypeDef && thisDef && prototypeDef.multi !== thisDef.multi) {
      return false;
    }
    if (areEqualProviderDefs(thisDef, prototypeDef, 'useValue', 'useClass', 'useFactory', 'useExisting')) {
      continue;
    }

    return false;
  }

  return true;
};

const areEqualMapsOfProviderDefs = (source: any, destination: any): boolean => {
  if (!destination || destination.size !== source.size) {
    return false;
  }
  for (const value of mapKeys(source)) {
    if (!destination.has(value)) {
      return false;
    }
    if (!areEqualProviders(destination.get(value), source.get(value))) {
      return false;
    }
  }

  return true;
};

const equalRenderDefs = (prototype: any, source: any): boolean => {
  if (prototype === source) {
    return true;
  }
  if ((typeof prototype === 'boolean' || typeof source === 'boolean') && prototype !== source) {
    return false;
  }
  if (prototype.$implicit !== source.$implicit) {
    return false;
  }
  if (!equalVariables(prototype.variables, source.variables)) {
    return false;
  }

  return true;
};

const equalRenderConfigs = (source: any, destination: any): boolean => {
  if (!equalRenderDefs(destination, source)) {
    return false;
  }
  if (typeof destination !== 'object' || typeof source !== 'object') {
    return true;
  }
  if (Object.keys(destination).length !== Object.keys(source).length) {
    return false;
  }
  for (const key of Object.keys(destination)) {
    if (!equalRenderDefs(destination[key], source[key])) {
      return false;
    }
  }

  return true;
};

const areEqualConfigParams = (source: any, destination: any): boolean => {
  if (destination === source) {
    return true;
  }
  if (destination.dependency !== source.dependency) {
    return false;
  }
  if (destination.export !== source.export) {
    return false;
  }
  if (destination.exportAll !== source.exportAll) {
    return false;
  }
  if (!equalRenderConfigs(source.render, destination.render)) {
    return false;
  }

  return true;
};

const areEqualConfigs = (
  source: Map<Type<any> | InjectionToken<any>, any>,
  destination: Map<Type<any> | InjectionToken<any>, any>,
): boolean => {
  if (!destination || destination.size !== source.size) {
    return false;
  }
  for (const value of mapKeys(source)) {
    if (!destination.has(value)) {
      return false;
    }
    if (!areEqualConfigParams(source.get(value), destination.get(value))) {
      return false;
    }
  }

  return true;
};

const equalVariables = (prototype: any, source: any): boolean => {
  if (prototype === source) {
    return true;
  }
  if (prototype && !source) {
    return false;
  }
  if (!prototype && source) {
    return false;
  }
  const prototypeKeys = Object.keys(prototype);
  const sourceKeys = Object.keys(source);
  if (prototypeKeys.length !== sourceKeys.length) {
    return false;
  }
  for (const key of prototypeKeys) {
    if (prototype[key] !== source[key]) {
      return false;
    }
  }

  return true;
};

export class MockBuilderPerformance extends MockBuilderPromise {
  public build(): NgModule {
    const global = ngMocksUniverse.global;

    // avoiding influences on cache when users extend the testing module.
    if (global.has('builder:module') && global.has('builder:config') && this.equalsTo(global.get('builder:config'))) {
      return requiredMetadata(global.get('builder:module'));
    }

    // removal of cached promise in case of mismatch
    if (global.has('builder:module')) {
      global.delete(global.get('builder:module'));
    }

    global.set('builder:config', this.cloneConfig());

    const ngModule = super.build();
    global.set('builder:module', ngModule);

    // avoiding influences on cache when users extend the testing module.
    return requiredMetadata(ngModule);
  }

  public async then<TResult1 = IMockBuilderResult>(
    fulfill?: ((value: IMockBuilderResult) => PromiseLike<TResult1>) | undefined | null,
    reject?: ((reason: any) => PromiseLike<never>) | undefined | null,
  ): Promise<TResult1> {
    const global = ngMocksUniverse.global;

    const flags = global.has('bullet') && global.has('builder:module') && global.has('builder:config');
    if (flags && this.equalsTo(global.get('builder:config'))) {
      return global.get(global.get('builder:module')).then(fulfill, reject);
    }

    // we need to reset testing module in case if we are in bullet mode but current module doesn't match.
    if (global.has('bullet') && global.has('bullet:reset')) {
      // tslint:disable-next-line no-console
      console.warn('ngMocks.faster has zero effect due to changes in testing module between runs');
      global.delete('bullet');
      TestBed.resetTestingModule();
      global.set('bullet', true);
    }

    const promise = super.then(fulfill, reject);
    global.set(global.get('builder:module'), promise);

    return promise;
  }

  private cloneConfig() {
    const config = getEmptyConfig();

    addValuesToSet(this.beforeCC, config.beforeCC);
    addValuesToSet(this.excludeDef, config.excludeDef);
    addValuesToSet(this.keepDef, config.keepDef);
    addValuesToSet(this.mockDef, config.mockDef);
    addValuesToSet(this.replaceDef, config.replaceDef);

    addEntitiesToMap(this.configDef, config.configDef);
    addEntitiesToMap(this.defProviders, config.defProviders);
    addEntitiesToMap(this.defValue, config.defValue);
    addEntitiesToMap(this.providerDef, config.providerDef);

    return config;
  }

  private equalsTo(prototype: Record<any, any>): boolean {
    for (const key of ['beforeCC', 'keepDef', 'replaceDef', 'excludeDef', 'mockDef']) {
      if (!areEqualSets((this as any)[key], prototype[key])) {
        return false;
      }
    }
    for (const key of ['defValue']) {
      if (!areEqualMaps((this as any)[key], prototype[key])) {
        return false;
      }
    }
    for (const key of ['providerDef', 'defProviders']) {
      if (!areEqualMapsOfProviderDefs((this as any)[key], prototype[key])) {
        return false;
      }
    }

    return areEqualConfigs(this.configDef, prototype.configDef);
  }
}

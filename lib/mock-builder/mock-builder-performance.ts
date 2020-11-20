import { NgModule } from '@angular/core';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';

import { flatten, mapEntries, mapKeys, mapValues } from '../common/core.helpers';
import ngMocksUniverse from '../common/ng-mocks-universe';

import { MockBuilderPromise } from './mock-builder-promise';
import { IMockBuilderResult } from './types';

export class MockBuilderPerformance extends MockBuilderPromise {
  public build(): NgModule {
    let ngModule: TestModuleMetadata;

    if (
      ngMocksUniverse.global.has('builder:module') &&
      ngMocksUniverse.global.has('builder:config') &&
      this.equalsTo(ngMocksUniverse.global.get('builder:config'))
    ) {
      ngModule = ngMocksUniverse.global.get('builder:module');

      // avoiding influences on cache when users extend the testing module.
      return {
        declarations: [...(ngModule.declarations || [])],
        imports: [...(ngModule.imports || [])],
        providers: [...(ngModule.providers || [])],
      };
    }

    // removal of cached promise in case of mismatch
    if (ngMocksUniverse.global.has('builder:module')) {
      ngMocksUniverse.global.delete(ngMocksUniverse.global.get('builder:module'));
    }

    const initialConfig = {
      beforeCC: new Set(),
      configDef: new Map(),
      defProviders: new Map(),
      defValue: new Map(),
      excludeDef: new Set(),
      keepDef: new Set(),
      mockDef: new Set(),
      providerDef: new Map(),
      replaceDef: new Set(),
    };
    for (const value of mapValues(this.beforeCC)) {
      initialConfig.beforeCC.add(value);
    }
    for (const [key, value] of mapEntries(this.configDef)) {
      initialConfig.configDef.set(key, value);
    }
    for (const [key, value] of mapEntries(this.defProviders)) {
      initialConfig.defProviders.set(key, value);
    }
    for (const [key, value] of mapEntries(this.defValue)) {
      initialConfig.defValue.set(key, value);
    }
    for (const value of mapValues(this.excludeDef)) {
      initialConfig.excludeDef.add(value);
    }
    for (const value of mapValues(this.keepDef)) {
      initialConfig.keepDef.add(value);
    }
    for (const value of mapValues(this.mockDef)) {
      initialConfig.mockDef.add(value);
    }
    for (const [key, value] of mapEntries(this.providerDef)) {
      initialConfig.providerDef.set(key, value);
    }
    for (const value of mapValues(this.replaceDef)) {
      initialConfig.replaceDef.add(value);
    }
    ngMocksUniverse.global.set('builder:config', initialConfig);

    ngModule = super.build();
    ngMocksUniverse.global.set('builder:module', ngModule);

    // avoiding influences on cache when users extend the testing module.
    return {
      declarations: [...(ngModule.declarations || [])],
      imports: [...(ngModule.imports || [])],
      providers: [...(ngModule.providers || [])],
    };
  }

  public async then<TResult1 = IMockBuilderResult>(
    fulfill?: ((value: IMockBuilderResult) => PromiseLike<TResult1>) | undefined | null,
    reject?: ((reason: any) => PromiseLike<never>) | undefined | null,
  ): Promise<TResult1> {
    if (
      ngMocksUniverse.global.has('bullet') &&
      ngMocksUniverse.global.has('builder:module') &&
      ngMocksUniverse.global.has('builder:config') &&
      this.equalsTo(ngMocksUniverse.global.get('builder:config'))
    ) {
      return ngMocksUniverse.global.get(ngMocksUniverse.global.get('builder:module')).then(fulfill, reject);
    }

    // we need to reset testing module in case if we are in bullet mode but current module doesn't match.
    if (ngMocksUniverse.global.has('bullet') && ngMocksUniverse.global.has('bullet:reset')) {
      // tslint:disable-next-line no-console
      console.warn('ngMocks.faster has zero effect due to changes in testing module between runs');
      ngMocksUniverse.global.delete('bullet');
      TestBed.resetTestingModule();
      ngMocksUniverse.global.set('bullet', true);
    }

    const promise = super.then(fulfill, reject);
    ngMocksUniverse.global.set(ngMocksUniverse.global.get('builder:module'), promise);

    return promise;
  }

  private equalProviders(prototype: any, source: any): boolean {
    // a case of multi vs non-multi
    if (Array.isArray(prototype) !== Array.isArray(source)) {
      return false;
    }
    const prototypeDefs = flatten(prototype);
    const thisDefs = flatten(source);
    if (prototypeDefs.length !== thisDefs.length) {
      return false;
    }
    for (let index = 0; index < prototypeDefs.length; index += 1) {
      const prototypeDef: any = prototypeDefs[index];
      const thisDef: any = thisDefs[index];

      if (prototypeDef && thisDef && prototypeDef.multi !== thisDef.multi) {
        return false;
      }
      if (
        prototypeDef &&
        thisDef &&
        prototypeDef.useValue &&
        thisDef.useValue &&
        prototypeDef.useValue === thisDef.useValue
      ) {
        continue;
      }
      if (
        prototypeDef &&
        thisDef &&
        prototypeDef.useClass &&
        thisDef.useClass &&
        prototypeDef.useClass === thisDef.useClass
      ) {
        continue;
      }
      if (
        prototypeDef &&
        thisDef &&
        prototypeDef.useFactory &&
        thisDef.useFactory &&
        prototypeDef.useFactory === thisDef.useFactory
      ) {
        continue;
      }
      if (
        prototypeDef &&
        thisDef &&
        prototypeDef.useExisting &&
        thisDef.useExisting &&
        prototypeDef.useExisting === thisDef.useExisting
      ) {
        continue;
      }
      if (prototypeDef === thisDef) {
        continue;
      }

      return false;
    }

    return true;
  }

  private equalRender(prototype: any, source: any): boolean {
    if (prototype === source) {
      return true;
    }
    if ((typeof prototype === 'boolean' || typeof source === 'boolean') && prototype !== source) {
      return false;
    }
    if (prototype.$implicit !== source.$implicit) {
      return false;
    }
    if (!this.equalVariables(prototype.variables, source.variables)) {
      return false;
    }

    return true;
  }

  private equalsTo(prototype: Record<any, any>): boolean {
    if (!prototype.beforeCC || prototype.beforeCC.size !== this.beforeCC.size) {
      return false;
    }
    for (const value of mapValues(this.beforeCC)) {
      if (!prototype.beforeCC.has(value)) {
        return false;
      }
    }

    if (!prototype.keepDef || prototype.keepDef.size !== this.keepDef.size) {
      return false;
    }
    for (const value of mapValues(this.keepDef)) {
      if (!prototype.keepDef.has(value)) {
        return false;
      }
    }

    if (!prototype.replaceDef || prototype.replaceDef.size !== this.replaceDef.size) {
      return false;
    }
    for (const value of mapValues(this.replaceDef)) {
      if (!prototype.replaceDef.has(value)) {
        return false;
      }
    }

    if (!prototype.excludeDef || prototype.excludeDef.size !== this.excludeDef.size) {
      return false;
    }
    for (const value of mapValues(this.excludeDef)) {
      if (!prototype.excludeDef.has(value)) {
        return false;
      }
    }

    if (!prototype.mockDef || prototype.mockDef.size !== this.mockDef.size) {
      return false;
    }
    for (const value of mapValues(this.mockDef)) {
      if (!prototype.mockDef.has(value)) {
        return false;
      }
    }

    if (!prototype.providerDef || prototype.providerDef.size !== this.providerDef.size) {
      return false;
    }
    for (const value of mapKeys(this.providerDef)) {
      if (!prototype.providerDef.has(value)) {
        return false;
      }
      if (!this.equalProviders(prototype.providerDef.get(value), this.providerDef.get(value))) {
        return false;
      }
    }

    if (!prototype.defProviders || prototype.defProviders.size !== this.defProviders.size) {
      return false;
    }
    for (const value of mapKeys(this.defProviders)) {
      if (!prototype.defProviders.has(value)) {
        return false;
      }
      if (!this.equalProviders(prototype.defProviders.get(value), this.defProviders.get(value))) {
        return false;
      }
    }

    if (!prototype.defValue || prototype.defValue.size !== this.defValue.size) {
      return false;
    }
    for (const value of mapKeys(this.defValue)) {
      if (!prototype.defValue.has(value)) {
        return false;
      }
      if (prototype.defValue.get(value) !== this.defValue.get(value)) {
        return false;
      }
    }

    if (!prototype.configDef || prototype.configDef.size !== this.configDef.size) {
      return false;
    }
    for (const value of mapKeys(this.configDef)) {
      if (!prototype.configDef.has(value)) {
        return false;
      }
      const configPrototype = prototype.configDef.get(value);
      const configThis = this.configDef.get(value);
      if (configPrototype === configThis) {
        continue;
      }
      if (configPrototype.dependency !== configThis.dependency) {
        return false;
      }
      if (configPrototype.export !== configThis.export) {
        return false;
      }
      if (configPrototype.exportAll !== configThis.exportAll) {
        return false;
      }
      if (!this.equalRender(configPrototype.render, configThis.render)) {
        return false;
      }
      if (typeof configPrototype.render !== 'object' || typeof configThis.render !== 'object') {
        continue;
      }
      if (Object.keys(configPrototype.render).length !== Object.keys(configThis.render).length) {
        return false;
      }
      for (const key of Object.keys(configPrototype.render)) {
        if (!this.equalRender(configPrototype.render[key], configThis.render[key])) {
          return false;
        }
      }
    }

    return true;
  }

  private equalVariables(prototype: any, source: any): boolean {
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
  }
}

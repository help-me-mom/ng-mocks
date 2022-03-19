import { TestBed, TestModuleMetadata } from '@angular/core/testing';

import ngMocksUniverse from '../common/ng-mocks-universe';

import { MockBuilderPromise } from './mock-builder.promise';
import addEntitiesToMap from './performance/add-entities-to-map';
import addValuesToSet from './performance/add-values-to-set';
import areEqualConfigParams from './performance/are-equal-config-params';
import areEqualMaps from './performance/are-equal-maps';
import areEqualProviders from './performance/are-equal-providers';
import areEqualSets from './performance/are-equal-sets';
import getEmptyConfig from './performance/get-empty-config';
import requiredMetadata from './performance/required-metadata';
import { IMockBuilderResult } from './types';

export class MockBuilderPerformance extends MockBuilderPromise {
  public build(): TestModuleMetadata {
    const global = ngMocksUniverse.global;

    // avoiding influences on cache when users extend the testing module.
    if (global.has('builder:module') && global.has('builder:config') && this.equalsTo(global.get('builder:config'))) {
      return requiredMetadata(global.get('builder:module'));
    }

    // removal of cached promise in case of mismatch
    if (global.has('builder:module')) {
      global.delete(global.get('builder:module'));
    }

    const clone = this.cloneConfig();
    const ngModule = super.build();
    global.set('builder:config', clone);
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

    // we need to reset testing module in case if we are in bullet mode but current module does not match.
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
      if (!areEqualMaps((this as any)[key], prototype[key], areEqualProviders)) {
        return false;
      }
    }

    return areEqualMaps(this.configDef, prototype.configDef, areEqualConfigParams);
  }
}

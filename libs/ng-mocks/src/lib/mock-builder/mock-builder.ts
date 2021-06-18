import { InjectionToken, NgModule } from '@angular/core';
import { getTestBed, MetadataOverride, TestBed, TestBedStatic, TestModuleMetadata } from '@angular/core/testing';

import coreConfig from '../common/core.config';
import coreDefineProperty from '../common/core.define-property';
import { flatten, mapEntries } from '../common/core.helpers';
import coreReflectModuleResolve from '../common/core.reflect.module-resolve';
import { AnyType, Type } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { ngMocks } from '../mock-helper/mock-helper';
import mockHelperFasterInstall from '../mock-helper/mock-helper.faster-install';

import funcExtractTokens from './func.extract-tokens';
import { MockBuilderPerformance } from './mock-builder.performance';
import { IMockBuilder } from './types';

const applyOverrides = (testBed: TestBedStatic, overrides: Map<AnyType<any>, MetadataOverride<any>>): void => {
  for (const [def, override] of mapEntries(overrides)) {
    (TestBed as any).ngMocksOverrides.add(def);
    // istanbul ignore else
    if (isNgDef(def, 'c')) {
      testBed.overrideComponent(def, override);
    } else if (isNgDef(def, 'd')) {
      testBed.overrideDirective(def, override);
    }
  }
};

const applyPlatformOverridesNormalization = (
  module: Type<any> | Array<Type<any>>,
  mocks: Map<any, any>,
  resetSet: Set<any>,
  track: Set<any>,
  callback: any,
): module is Type<any> => {
  // istanbul ignore if
  if (Array.isArray(module)) {
    for (const moduleCtor of module) {
      callback(moduleCtor, mocks, resetSet, track);
    }

    return false;
  }
  // istanbul ignore if
  if (track.has(module)) {
    return false;
  }
  track.add(module);

  return true;
};

const applyPlatformOverride = (overrides: any, ctorDef: AnyType<any>, mock: AnyType<any>, prop: string): boolean => {
  const bucketAdd: any[] = overrides.add[prop] || [];
  bucketAdd.push(mock);
  overrides.add[prop] = bucketAdd;

  const bucketRemove: any[] = overrides.remove[prop] || [];
  bucketRemove.push(ctorDef);
  overrides.remove[prop] = bucketRemove;

  return true;
};

const applyPlatformOverridesGetMock = (mocks: Map<any, any>, ctorDef: any): AnyType<any> | undefined => {
  const mock = mocks.get(ctorDef);
  if (mock && mock !== ctorDef && coreConfig.neverMockModule.indexOf(ctorDef) !== -1) {
    return mock;
  }

  return undefined;
};

const applyPlatformOverridesData = (module: AnyType<any>): Array<['imports' | 'exports', any]> => {
  const result: Array<['imports' | 'exports', any]> = [];
  const meta = coreReflectModuleResolve(module);
  for (const prop of ['imports', 'exports'] as const) {
    for (const ctorDef of meta[prop] || []) {
      result.push([prop, ctorDef]);
    }
  }

  return result;
};

const applyPlatformOverrides = (
  module: Type<any> | Array<Type<any>>,
  mocks: Map<any, any>,
  resetSet: Set<any>,
  track: Set<any>,
): void => {
  // istanbul ignore if
  if (!applyPlatformOverridesNormalization(module, mocks, resetSet, track, applyPlatformOverrides)) {
    return;
  }

  let changed = false;
  const overrides: MetadataOverride<NgModule> = { add: {}, remove: {} };

  for (const [prop, ctorDef] of applyPlatformOverridesData(module)) {
    if (!isNgDef(ctorDef, 'm')) {
      continue;
    }

    const mock = applyPlatformOverridesGetMock(mocks, ctorDef);
    if (mock) {
      changed = applyPlatformOverride(overrides, ctorDef, mock, prop);
    } else {
      applyPlatformOverrides(ctorDef, mocks, resetSet, track);
    }
  }

  if (changed) {
    resetSet.add(module);
    TestBed.overrideModule(module, overrides);
  }
};

// Thanks Ivy and its TestBed.override - it does not clean up leftovers.
const applyNgMocksOverrides = (testBed: TestBedStatic & { ngMocksOverrides?: any }): void => {
  if (testBed.ngMocksOverrides) {
    ngMocks.flushTestBed();
    for (const def of testBed.ngMocksOverrides) {
      // istanbul ignore else
      if (isNgDef(def, 'c')) {
        testBed.overrideComponent(def, {});
      } else if (isNgDef(def, 'd')) {
        testBed.overrideDirective(def, {});
      } else if (isNgDef(def, 'm')) {
        testBed.overrideModule(def, {});
      }
    }
    testBed.ngMocksOverrides = undefined;
  }
};

const initTestBed = () => {
  if (!(TestBed as any).ngMocksSelectors) {
    coreDefineProperty(TestBed, 'ngMocksSelectors', new Map());
  }
  // istanbul ignore else
  if (!(TestBed as any).ngMocksOverrides) {
    coreDefineProperty(TestBed, 'ngMocksOverrides', new Set());
  }
};

const configureTestingModule =
  (original: TestBedStatic['configureTestingModule']): TestBedStatic['configureTestingModule'] =>
  (moduleDef: TestModuleMetadata) => {
    initTestBed();
    const { mocks, overrides } = funcExtractTokens(moduleDef.providers);

    if (mocks) {
      ngMocks.flushTestBed();
    }
    const testBedStatic = original.call(TestBed, moduleDef);
    if (!mocks) {
      return testBedStatic;
    }

    // istanbul ignore else
    if (overrides) {
      applyOverrides(testBedStatic, overrides);
    }
    const testBed = getTestBed();
    // istanbul ignore else
    if (testBed && testBed.ngModule) {
      applyPlatformOverrides(testBed.ngModule, mocks, (TestBed as any).ngMocksOverrides, new Set());
    }

    return testBedStatic;
  };

const resetTestingModule =
  (original: TestBedStatic['resetTestingModule']): TestBedStatic['resetTestingModule'] =>
  () => {
    ngMocksUniverse.global.delete('builder:config');
    ngMocksUniverse.global.delete('builder:module');
    (TestBed as any).ngMocksSelectors = undefined;
    applyNgMocksOverrides(TestBed);

    return original.call(TestBed);
  };

let needInstall = true;
const install = () => {
  const hooks = mockHelperFasterInstall();
  if (needInstall) {
    // istanbul ignore else
    if (hooks.before.indexOf(configureTestingModule) === -1) {
      hooks.before.push(configureTestingModule);
    }
    // istanbul ignore else
    if (hooks.after.indexOf(resetTestingModule) === -1) {
      hooks.after.push(resetTestingModule);
    }
    needInstall = false;
  }
};

/**
 * @see https://ng-mocks.sudo.eu/api/MockBuilder
 */
export function MockBuilder(
  keepDeclaration?:
    | string
    | AnyType<any>
    | InjectionToken<any>
    | Array<string | AnyType<any> | InjectionToken<any>>
    | null
    | undefined,
  itsModuleToMock?: AnyType<any> | Array<AnyType<any>> | null | undefined,
): IMockBuilder {
  install();

  const instance = new MockBuilderPerformance();

  if (keepDeclaration) {
    for (const declaration of flatten(keepDeclaration)) {
      instance.keep(declaration, {
        export: true,
      });
    }
  }
  if (itsModuleToMock) {
    for (const declaration of flatten(itsModuleToMock)) {
      instance.mock(declaration, {
        exportAll: true,
      });
    }
  }

  return instance;
}

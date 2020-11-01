import { InjectionToken } from '@angular/core';
import { MetadataOverride, TestBed, TestModuleMetadata } from '@angular/core/testing';

import { flatten, mapEntries } from '../common/core.helpers';
import { NG_MOCKS, NG_MOCKS_OVERRIDES } from '../common/core.tokens';
import { AnyType } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';
import { ngMocksUniverse } from '../common/ng-mocks-universe';
import { ngMocks } from '../mock-helper/mock-helper';

import { MockBuilderPerformance } from './mock-builder-performance';
import { IMockBuilder } from './types';

/**
 * @see https://github.com/ike18t/ng-mocks#mockbuilder
 */
export function MockBuilder(
  keepDeclaration?: AnyType<any> | InjectionToken<any> | null | undefined,
  itsModuleToMock?: AnyType<any> | null | undefined
): IMockBuilder {
  if (!(TestBed as any).ngMocks) {
    const configureTestingModule = TestBed.configureTestingModule;
    TestBed.configureTestingModule = (moduleDef: TestModuleMetadata) => {
      ngMocksUniverse.global.set('bullet:customized', true);
      let mocks: Map<any, any> | undefined;
      let overrides: Map<AnyType<any>, MetadataOverride<any>> = new Map();

      for (const provide of flatten(moduleDef.providers || [])) {
        if (typeof provide !== 'object') {
          continue;
        }
        if (provide.provide === NG_MOCKS) {
          mocks = provide.useValue;
        }
        if (provide.provide === NG_MOCKS_OVERRIDES) {
          overrides = provide.useValue;
        }
      }

      if (mocks) {
        ngMocks.flushTestBed();
      }
      const testBed = configureTestingModule.call(TestBed, moduleDef);
      if (!mocks) {
        return testBed;
      }

      /* istanbul ignore else */
      // Now we can apply overrides.
      if (!(TestBed as any).ngMocksOverrides) {
        (TestBed as any).ngMocksOverrides = new Set();
      }
      for (const [def, override] of mapEntries(overrides)) {
        (TestBed as any).ngMocksOverrides.add(def);
        /* istanbul ignore else */
        if (isNgDef(def, 'm')) {
          testBed.overrideModule(def, override);
        } else if (isNgDef(def, 'c')) {
          testBed.overrideComponent(def, override);
        } else if (isNgDef(def, 'd')) {
          testBed.overrideDirective(def, override);
        }
      }

      return testBed;
    };

    const resetTestingModule = TestBed.resetTestingModule;
    (TestBed as any).resetTestingModule = () => {
      if (ngMocksUniverse.global.has('bullet')) {
        if (ngMocksUniverse.global.has('bullet:customized')) {
          ngMocksUniverse.global.set('bullet:reset', true);
        }
        return TestBed;
      }
      ngMocksUniverse.global.delete('bullet:customized');
      ngMocksUniverse.global.delete('bullet:reset');

      // Thanks Ivy and its TestBed.override - it doesn't clean up leftovers.
      if ((TestBed as any).ngMocksOverrides) {
        ngMocks.flushTestBed();
        for (const def of (TestBed as any).ngMocksOverrides) {
          /* istanbul ignore else */
          if (isNgDef(def, 'm')) {
            TestBed.overrideModule(def, {});
          } else if (isNgDef(def, 'c')) {
            TestBed.overrideComponent(def, {});
          } else if (isNgDef(def, 'd')) {
            TestBed.overrideDirective(def, {});
          }
        }
        (TestBed as any).ngMocksOverrides = undefined;
      }

      return resetTestingModule.call(TestBed);
    };

    (TestBed as any).ngMocks = true;
  }

  const instance = new MockBuilderPerformance();

  if (keepDeclaration) {
    instance.keep(keepDeclaration, {
      export: true,
    });
  }
  if (itsModuleToMock) {
    instance.mock(itsModuleToMock, {
      exportAll: true,
    });
  }
  return instance;
}

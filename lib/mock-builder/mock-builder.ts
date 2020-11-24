import { InjectionToken } from '@angular/core';
import { MetadataOverride, TestBed, TestBedStatic, TestModuleMetadata } from '@angular/core/testing';

import { flatten, mapEntries } from '../common/core.helpers';
import { NG_MOCKS, NG_MOCKS_OVERRIDES } from '../common/core.tokens';
import { AnyType } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { ngMocks } from '../mock-helper/mock-helper';

import { MockBuilderPerformance } from './mock-builder-performance';
import { IMockBuilder } from './types';

const extractTokens = (
  providers: any,
): {
  mocks?: Map<any, any>;
  overrides?: Map<AnyType<any>, MetadataOverride<any>>;
} => {
  let mocks: Map<any, any> | undefined;
  let overrides: Map<AnyType<any>, MetadataOverride<any>> | undefined;

  for (const provide of flatten(providers || [])) {
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

  return {
    mocks,
    overrides,
  };
};

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

/**
 * @see https://github.com/ike18t/ng-mocks#mockbuilder
 */
export function MockBuilder(
  keepDeclaration?: AnyType<any> | InjectionToken<any> | null | undefined,
  itsModuleToMock?: AnyType<any> | null | undefined,
): IMockBuilder {
  if (!(TestBed as any).ngMocks) {
    const configureTestingModule = TestBed.configureTestingModule;

    TestBed.configureTestingModule = (moduleDef: TestModuleMetadata) => {
      ngMocksUniverse.global.set('bullet:customized', true);
      const { mocks, overrides } = extractTokens(moduleDef.providers);

      if (mocks) {
        ngMocks.flushTestBed();
      }
      const testBed = configureTestingModule.call(TestBed, moduleDef);
      if (!mocks) {
        return testBed;
      }

      // istanbul ignore else
      // Now we can apply overrides.
      if (!(TestBed as any).ngMocksOverrides) {
        (TestBed as any).ngMocksOverrides = new Set();
      }
      // istanbul ignore else
      if (overrides) {
        applyOverrides(testBed, overrides);
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
          // istanbul ignore else
          if (isNgDef(def, 'c')) {
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

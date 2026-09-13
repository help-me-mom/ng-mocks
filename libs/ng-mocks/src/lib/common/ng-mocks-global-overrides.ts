import { getTestBed, MetadataOverride, TestBed, TestBedStatic, TestModuleMetadata } from '@angular/core/testing';

import funcExtractTokens from '../mock-builder/func.extract-tokens';
import { MockBuilder } from '../mock-builder/mock-builder';
import { ngMocks } from '../mock-helper/mock-helper';
import mockHelperFasterInstall from '../mock-helper/mock-helper.faster-install';

import coreDefineProperty from './core.define-property';
import { flatten } from './core.helpers';
import { NG_MOCKS_ROOT_PROVIDERS } from './core.tokens';
import { AnyDeclaration, AnyType, Type } from './core.types';
import funcApplyTestBedOverride from './func.apply-test-bed-override';
import { funcExtractDeps } from './func.extract-deps';
import { getSourceOfMock } from './func.get-source-of-mock';
import funcGetType from './func.get-type';
import { isMockNgDef } from './func.is-mock-ng-def';
import { isNgDef } from './func.is-ng-def';
import { isNgModuleDefWithProviders } from './func.is-ng-module-def-with-providers';
import { resetDeclarationFactories } from './ng-mocks-declaration-factories';
import { rememberMockDeclarations, resetInjectedDeclarations } from './ng-mocks-injected-declarations';
import { applyPlatformOverrides, defineTouches } from './ng-mocks-platform-overrides';
import { resetRuntimeInject } from './ng-mocks-runtime-inject';
import { installTestBedInjection } from './ng-mocks-test-bed-injection';
import { rememberTestModuleOptions, resetTestModuleOptions } from './ng-mocks-test-module-metadata';
import ngMocksUniverse from './ng-mocks-universe';
import { installViewContainer } from './ng-mocks-view-container';

const applyOverrides = (overrides: Map<AnyType<any>, [MetadataOverride<any>, MetadataOverride<any>]>): void => {
  // eslint-disable-next-line unicorn/no-useless-spread -- Keep the pending list stable across TestBed override calls.
  for (const [def, [override, original]] of [...overrides]) {
    (TestBed as any).ngMocksOverrides.set(def, {
      ...original,
      override,
    });
    funcApplyTestBedOverride(def, override);
  }
};

// Thanks Ivy and its TestBed.override - it does not clean up leftovers.
const applyNgMocksOverrides = (testBed: TestBedStatic & { ngMocksOverrides?: Map<any, any> }): void => {
  const errors: unknown[] = [];
  try {
    if (testBed.ngMocksOverrides?.size) {
      try {
        ngMocks.flushTestBed();
      } catch (error) {
        errors.push(error);
      }
      // eslint-disable-next-line unicorn/no-useless-spread -- TestBed override calls can update the shared registry.
      for (const [def, original] of [...testBed.ngMocksOverrides]) {
        try {
          funcApplyTestBedOverride(def, original);
        } catch (error) {
          errors.push(error);
        }
      }
    }
  } finally {
    testBed.ngMocksOverrides = undefined;
  }
  if (errors.length > 0) {
    throw errors[0];
  }
};

const initTestBed = () => {
  installTestBedInjection(TestBed as never);
  installTestBedInjection(getTestBed() as never);
  if (!(TestBed as any).ngMocksSelectors) {
    coreDefineProperty(TestBed, 'ngMocksSelectors', new Map());
  }
  // istanbul ignore else
  if (!(TestBed as any).ngMocksOverrides) {
    coreDefineProperty(TestBed, 'ngMocksOverrides', new Map());
  }
};

const collectMockDeclarations = (moduleDef: TestModuleMetadata, mocks?: Map<any, any>): Map<any, any> | undefined => {
  let result = mocks;

  for (const key of ['imports', 'declarations'] as const) {
    for (const declaration of flatten(moduleDef[key] || [])) {
      const def = funcGetType(declaration);
      if (isMockNgDef(def, 'c') || isMockNgDef(def, 'd') || isMockNgDef(def, 'p')) {
        const source = getSourceOfMock(def);
        if (result?.get(source) === def) {
          continue;
        }
        if (result === mocks) {
          result = new Map(mocks);
        }
        result!.set(source, def);
      }
    }
  }

  return result?.size ? result : undefined;
};

const configureTestingModule =
  (
    original: TestBedStatic['configureTestingModule'],
    instance: TestBedStatic,
  ): TestBedStatic['configureTestingModule'] =>
  (moduleDef: TestModuleMetadata) => {
    initTestBed();

    const useMockBuilder =
      typeof moduleDef === 'object' &&
      !!moduleDef &&
      (!moduleDef.providers || moduleDef.providers.indexOf(MockBuilder) === -1);
    // 0b10 - mock exist
    // 0b01 - real exist
    let hasMocks = 0;
    const declarations: any[] = [];
    for (const key of useMockBuilder ? ['imports', 'declarations'] : []) {
      for (const declaration of flatten(moduleDef[key as never]) as any[]) {
        if (!declaration) {
          continue;
        }
        declarations.push(declaration);
        hasMocks |= isMockNgDef(funcGetType(declaration)) ? 0b10 : 0b01;
      }
    }
    // We should do magic only then both mock and real exist.
    let finalModuleDef = hasMocks === 0b11 ? undefined : moduleDef;
    if (!finalModuleDef) {
      const mockBuilder: Array<[any, any, boolean]> = [];
      for (const declaration of declarations) {
        mockBuilder.push([
          isNgModuleDefWithProviders(declaration)
            ? {
                ngModule: getSourceOfMock(declaration.ngModule),
                providers: declaration.providers,
              }
            : getSourceOfMock(declaration),
          isNgModuleDefWithProviders(declaration) ? declaration.ngModule : declaration,
          isMockNgDef(funcGetType(declaration)),
        ]);
      }
      let builder = MockBuilder(NG_MOCKS_ROOT_PROVIDERS);

      const realDependencies = new Set<AnyType<any>>();
      const explicitMockDefinitions = new Set<AnyDeclaration<any>>();
      const visitedDependencies = new Set<AnyType<any>>();
      for (const [source, , isMock] of mockBuilder) {
        if (isMock) {
          explicitMockDefinitions.add(funcGetType(source));
        }
      }
      const shouldTraverse = (dependency: AnyDeclaration<any>): boolean => {
        const resolution = ngMocksUniverse.getResolution(dependency);

        // Explicit mocks and non-keep resolutions stop inferred keeps, but shared
        // dependencies can still be kept when another real path reaches them.
        return !explicitMockDefinitions.has(dependency) && (!resolution || resolution === 'keep');
      };
      for (const [source, , isMock] of mockBuilder) {
        if (!isMock) {
          funcExtractDeps(funcGetType(source), realDependencies, true, visitedDependencies, shouldTraverse);
        }
      }
      for (const dependency of realDependencies) {
        // Explicit TestBed entries are applied below and take precedence.
        // Global resolutions keep their existing MockBuilder semantics.
        if (!ngMocksUniverse.getResolution(dependency)) {
          builder = builder.keep(dependency, { dependency: true });
        }
      }

      for (const [source, def, isMock] of mockBuilder) {
        const transform = def.prototype.__ngMocksConfig?.transform;
        const options = {
          export: !isNgDef(source, 'm'),
          exportAll: false,
          onRoot: true,
        };
        builder =
          isMock && transform
            ? builder.mock(source, transform, options)
            : isMock
              ? builder.mock(source, options)
              : builder.keep(source, options);
      }

      finalModuleDef = builder.build();
      // Ivy's module override traversal depends on the explicit import order.
      // Repeated ModuleWithProviders entries are already merged at their last occurrence.
      const importOrder = new Set<Type<unknown>>();
      for (const declaration of flatten(moduleDef.imports ?? [])) {
        const source = getSourceOfMock(funcGetType(declaration));
        importOrder.delete(source);
        importOrder.add(source);
      }
      const imports = new Map<Type<unknown>, unknown[]>();
      for (const declaration of finalModuleDef.imports!) {
        const source = getSourceOfMock(funcGetType(declaration));
        const entries = imports.get(source) ?? [];
        entries.push(declaration);
        imports.set(source, entries);
      }
      finalModuleDef.imports = [];
      for (const source of importOrder) {
        if (imports.has(source)) {
          finalModuleDef.imports.push(...imports.get(source)!);
          imports.delete(source);
        }
      }
      for (const entries of imports.values()) {
        finalModuleDef.imports.push(...entries);
      }
      finalModuleDef = {
        ...moduleDef,
        ...finalModuleDef,
        providers: [...(moduleDef.providers ?? []), ...(finalModuleDef.providers as never)],
      };
    }

    const testBed = getTestBed();

    const providers = funcExtractTokens(finalModuleDef.providers);
    const { mocks, overrides } = providers;
    // touches are important, therefore we are trying to fetch them from the known providers.
    const touches = defineTouches(testBed, finalModuleDef, providers.touches);

    if (mocks) {
      ngMocks.flushTestBed();
    }

    // Track mocked source declarations so TestBed.inject / get only replays overrides for mocked
    // components, directives, and pipes in the current TestBed.
    rememberMockDeclarations(collectMockDeclarations(finalModuleDef, mocks));

    // istanbul ignore else
    if (overrides) {
      applyOverrides(overrides);
    }
    // _testModuleRef exists only after the 1st call,
    // so we shouldn't override platform again.
    if (touches && !(testBed as any)._instantiated && !(testBed as any)._testModuleRef) {
      applyPlatformOverrides(testBed, touches);
    }

    const result = original.call(instance, finalModuleDef);
    rememberTestModuleOptions(finalModuleDef);

    return result;
  };

const resetTestingModule =
  (original: TestBedStatic['resetTestingModule'], instance: TestBedStatic): TestBedStatic['resetTestingModule'] =>
  () => {
    resetRuntimeInject();
    ngMocksUniverse.global.delete('builder:config');
    ngMocksUniverse.global.delete('builder:module');
    ngMocksUniverse.global.delete('builder:promise');
    resetTestModuleOptions();
    (TestBed as any).ngMocksSelectors = undefined;
    resetInjectedDeclarations();
    const errors: unknown[] = [];
    try {
      applyNgMocksOverrides(TestBed);
    } catch (error) {
      errors.push(error);
    }

    let result: ReturnType<TestBedStatic['resetTestingModule']> = instance;
    try {
      result = original.call(instance);
    } catch (error) {
      errors.push(error);
    } finally {
      // Older Ivy TestBed versions restore directive definitions but leave recompiled factories behind.
      resetDeclarationFactories();
    }
    if (errors.length > 0) {
      throw errors[0];
    }

    return result;
  };

const install = () => {
  // istanbul ignore else
  if (!(TestBed as any).ngMocksOverridesInstalled) {
    const hooks = mockHelperFasterInstall();
    installViewContainer();
    initTestBed();

    // istanbul ignore else
    if (hooks.before.indexOf(configureTestingModule) === -1) {
      hooks.before.push(configureTestingModule);
    }
    // istanbul ignore else
    if (hooks.after.indexOf(resetTestingModule) === -1) {
      hooks.after.push(resetTestingModule);
    }

    coreDefineProperty(TestBed, 'ngMocksOverridesInstalled', true);
  }
};

install();

import { Injector, ViewContainerRef } from '@angular/core';
import { getTestBed, MetadataOverride, TestBed, TestBedStatic, TestModuleMetadata } from '@angular/core/testing';

import funcExtractTokens from '../mock-builder/func.extract-tokens';
import { MockBuilder } from '../mock-builder/mock-builder';
import getOverrideDef from '../mock-builder/promise/get-override-def';
import { ngMocks } from '../mock-helper/mock-helper';
import mockHelperFasterInstall from '../mock-helper/mock-helper.faster-install';
import { MockProvider } from '../mock-provider/mock-provider';
import helperCreateClone from '../mock-service/helper.create-clone';

import coreConfig from './core.config';
import coreDefineProperty from './core.define-property';
import { flatten, mapEntries, mapValues } from './core.helpers';
import coreInjector from './core.injector';
import coreReflectMeta from './core.reflect.meta';
import coreReflectModuleResolve from './core.reflect.module-resolve';
import coreReflectProvidedIn from './core.reflect.provided-in';
import { NG_MOCKS, NG_MOCKS_ROOT_PROVIDERS, NG_MOCKS_TOUCHES } from './core.tokens';
import { AnyType, dependencyKeys } from './core.types';
import { getSourceOfMock } from './func.get-source-of-mock';
import funcGetType from './func.get-type';
import { isMockNgDef } from './func.is-mock-ng-def';
import { isNgDef } from './func.is-ng-def';
import { isNgModuleDefWithProviders } from './func.is-ng-module-def-with-providers';
import ngMocksUniverse from './ng-mocks-universe';

const applyOverride = (def: any, override: any) => {
  if (isNgDef(def, 'c')) {
    TestBed.overrideComponent(def, override);
  } else if (isNgDef(def, 'd')) {
    TestBed.overrideDirective(def, override);
  } else if (isNgDef(def, 'm')) {
    TestBed.overrideModule(def, override);
  }
  if (isNgDef(def, 't')) {
    TestBed.overrideProvider(def, override);
  } else if (isNgDef(def, 'i')) {
    TestBed.overrideProvider(def, override);
  }
};

const applyOverrides = (overrides: Map<AnyType<any>, [MetadataOverride<any>, MetadataOverride<any>]>): void => {
  for (const [def, [override, original]] of mapEntries(overrides)) {
    (TestBed as any).ngMocksOverrides.set(def, {
      ...original,
      override,
    });
    applyOverride(def, override);
  }
};

// Thanks Ivy and its TestBed.override - it does not clean up leftovers.
const applyNgMocksOverrides = (testBed: TestBedStatic & { ngMocksOverrides?: Map<any, any> }): void => {
  if (testBed.ngMocksOverrides?.size) {
    ngMocks.flushTestBed();
    for (const [def, original] of mapEntries(testBed.ngMocksOverrides)) {
      applyOverride(def, original);
    }
  }
  testBed.ngMocksOverrides = undefined;
};

const initTestBed = () => {
  if (!(TestBed as any).ngMocksSelectors) {
    coreDefineProperty(TestBed, 'ngMocksSelectors', new Map());
  }
  // istanbul ignore else
  if (!(TestBed as any).ngMocksOverrides) {
    coreDefineProperty(TestBed, 'ngMocksOverrides', new Map());
  }
};

const generateTouches = (moduleDef: Partial<Record<dependencyKeys, any>>, touches: Set<any>): void => {
  for (const key of coreConfig.dependencies) {
    for (const item of moduleDef[key] ? flatten(moduleDef[key]) : []) {
      const def = funcGetType(item);
      if (isNgModuleDefWithProviders(item)) {
        generateTouches(item, touches);
      }
      if (touches.has(def)) {
        continue;
      }
      touches.add(def);
      if (typeof def !== 'function') {
        continue;
      }

      if (!Object.prototype.hasOwnProperty.call(def, '__ngMocksTouches')) {
        const local = new Set<any>();
        const meta = coreReflectMeta(def);
        coreDefineProperty(def, '__ngMocksTouches', local, false);
        if (meta) {
          generateTouches(meta, local);
        }
      }

      mapValues(def.__ngMocksTouches, touches);
    }
  }
};

const defineTouches = (testBed: TestBed, moduleDef: TestModuleMetadata, knownTouches?: Set<any>) => {
  let touches = knownTouches;

  if (!touches && ngMocksUniverse.getDefaults().size > 0) {
    touches = funcExtractTokens(
      (testBed as any)._providers || /* istanbul ignore next Ivy part */ (testBed as any)._compiler?.providers,
    ).touches;
    if (!touches) {
      touches = new Set();
      moduleDef.providers = moduleDef.providers || [];
      moduleDef.providers.push({ provide: NG_MOCKS_TOUCHES, useValue: touches });
    }
    generateTouches(moduleDef, touches);
  }

  return touches;
};

const applyPlatformOverrideDef = (def: any) => {
  const ngModule = funcGetType(def);
  if ((TestBed as any).ngMocksOverrides.has(ngModule)) {
    return;
  }

  const original = coreReflectModuleResolve(ngModule);
  const set = getOverrideDef(original);
  if (set) {
    (TestBed as any).ngMocksOverrides.set(ngModule, { set: original });
    TestBed.overrideModule(ngModule, { set });
  }
};

const applyPlatformOverridesBasedOnProvidedIn = (provide: any, touches: Set<any>) => {
  const providedIn = coreReflectProvidedIn(provide);
  if (!providedIn) {
    return;
  }
  // knownTouches present from MockBuilder and we can rely on it,
  // otherwise we have to override the provider always.
  if (typeof providedIn !== 'string' && !touches.has(providedIn)) {
    return;
  }
  (TestBed as any).ngMocksOverrides.set(provide, {});
  TestBed.overrideProvider(provide, MockProvider(provide as never));
};

const applyPlatformOverridesBasedOnDefaults = (touches: Set<any>) => {
  for (const [provide, [config]] of mapEntries(ngMocksUniverse.getDefaults())) {
    if (config !== 'mock') {
      continue;
    }
    if (!isNgDef(provide, 'i') && !isNgDef(provide, 't')) {
      continue;
    }
    if (touches.has(provide)) {
      continue;
    }
    if ((TestBed as any).ngMocksOverrides.has(provide)) {
      continue;
    }
    applyPlatformOverridesBasedOnProvidedIn(provide, touches);
  }
};

const applyPlatformOverrides = (testBed: TestBed, touches: Set<any>) => {
  // istanbul ignore else
  if ((TestBed as any).ngMocksOverrides) {
    const backup = ngMocksUniverse.touches;
    ngMocksUniverse.touches = touches;
    for (const def of flatten(testBed.ngModule || /* istanbul ignore next */ [])) {
      applyPlatformOverrideDef(def);
    }
    applyPlatformOverridesBasedOnDefaults(touches);
    ngMocksUniverse.touches = backup;
  }
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
    const mockBuilder: Array<[any, any, boolean]> = [];
    for (const key of useMockBuilder ? ['imports', 'declarations'] : []) {
      for (const declaration of flatten(moduleDef[key as never]) as any[]) {
        if (!declaration) {
          continue;
        }
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
        if (key === 'imports') {
          hasMocks |= mockBuilder[mockBuilder.length - 1][2] ? 0b10 : 0b01;
        }
      }
    }
    // We should do magic only then both mock and real exist.
    let finalModuleDef = hasMocks === 0b11 ? undefined : moduleDef;
    if (!finalModuleDef) {
      let builder = MockBuilder(NG_MOCKS_ROOT_PROVIDERS);
      for (const [source, def, isMock] of mockBuilder) {
        const transform = def.prototype.__ngMocksConfig?.transform;
        builder =
          isMock && transform ? builder.mock(source, transform) : isMock ? builder.mock(source) : builder.keep(source);
      }
      finalModuleDef = builder.build();
      finalModuleDef = {
        ...moduleDef,
        ...finalModuleDef,
        providers: [...(moduleDef.providers ?? []), ...(finalModuleDef.providers as never)],
      };
    }

    const testBed = getTestBed();

    const providers = funcExtractTokens(finalModuleDef.providers);
    const { mocks, overrides } = providers;
    // touches are important,
    // therefore we are trying to fetch them from the known providers.
    const touches = defineTouches(testBed, finalModuleDef, providers.touches);

    if (mocks) {
      ngMocks.flushTestBed();
    }

    // istanbul ignore else
    if (overrides) {
      applyOverrides(overrides);
    }
    // _testModuleRef exists only after the 1st call,
    // so we shouldn't override platform again.
    if (touches && !(testBed as any)._instantiated && !(testBed as any)._testModuleRef) {
      applyPlatformOverrides(testBed, touches);
    }

    return original.call(instance, finalModuleDef);
  };

const resetTestingModule =
  (original: TestBedStatic['resetTestingModule'], instance: TestBedStatic): TestBedStatic['resetTestingModule'] =>
  () => {
    ngMocksUniverse.global.delete('builder:config');
    ngMocksUniverse.global.delete('builder:module');
    (TestBed as any).ngMocksSelectors = undefined;
    applyNgMocksOverrides(TestBed);

    return original.call(instance);
  };

const viewContainerInstall = () => {
  const vcr: any = ViewContainerRef;

  // istanbul ignore else
  if (!vcr.ngMocksOverridesInstalled) {
    const ngElementId = vcr.__NG_ELEMENT_ID__;

    // istanbul ignore else
    if (ngElementId) {
      coreDefineProperty(
        vcr,
        '__NG_ELEMENT_ID__',
        helperCreateClone(ngElementId, undefined, undefined, (...ngElementIdArgs: any[]) => {
          const vcrInstance = ngElementId.apply(ngElementId, ngElementIdArgs);

          const createComponent = vcrInstance.createComponent;
          coreDefineProperty(
            vcrInstance,
            'createComponent',
            helperCreateClone(
              createComponent,
              undefined,
              undefined,
              (component: any, ...createComponentArgs: any[]) => {
                const map = coreInjector(NG_MOCKS, vcrInstance.injector);

                return createComponent.apply(vcrInstance, [
                  map?.get(component) ?? component,
                  ...createComponentArgs,
                ] as any);
              },
            ),
            true,
          );

          return vcrInstance;
        }),
        true,
      );
    }

    coreDefineProperty(ViewContainerRef, 'ngMocksOverridesInstalled', true);
  }
};

// this function monkey-patches Angular injectors.
const installInjector = (injector: Injector & { __ngMocksInjector?: any }): Injector => {
  // skipping the matched injector
  if (injector.constructor.prototype.__ngMocksInjector || !injector.constructor.prototype.get) {
    return injector;
  }

  // marking the injector as patched
  coreDefineProperty(injector.constructor.prototype, '__ngMocksInjector', true);
  const injectorGet = injector.constructor.prototype.get;

  // patch
  injector.constructor.prototype.get = helperCreateClone(
    injectorGet,
    undefined,
    undefined,
    function (token: any, ...argsGet: any) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const binding: any = this;

      // Here we can implement custom logic how to inject token,
      // for example, replace with a provider def we need.

      const result = injectorGet.call(binding, token, ...argsGet);
      // If the result is an injector, we should patch it too.
      if (
        result &&
        typeof result === 'object' &&
        typeof result.constructor === 'function' &&
        typeof result.constructor.name === 'string' &&
        result.constructor.name.slice(-8) === 'Injector'
      ) {
        installInjector(result);
      }

      return result;
    },
  );

  return injector;
};

const install = () => {
  // istanbul ignore else
  if (!(TestBed as any).ngMocksOverridesInstalled) {
    const hooks = mockHelperFasterInstall();
    viewContainerInstall();

    // istanbul ignore else
    if (hooks.before.indexOf(configureTestingModule) === -1) {
      hooks.before.push(configureTestingModule);
    }
    // istanbul ignore else
    if (hooks.after.indexOf(resetTestingModule) === -1) {
      hooks.after.push(resetTestingModule);
    }

    coreDefineProperty(TestBed, 'ngMocksOverridesInstalled', true);
    const injectorCreate = Injector.create;
    Injector.create = helperCreateClone(injectorCreate, undefined, undefined, (...argsCreate: any) =>
      installInjector(injectorCreate.apply(Injector, argsCreate)),
    );
    try {
      // force install of our injector.
      Injector.create({ length: 0, providers: [] } as never);
    } catch {
      // nothing to do.
    }
  }
};

install();

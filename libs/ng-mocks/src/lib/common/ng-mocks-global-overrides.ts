import { Component, Directive, NgModule, Pipe } from '@angular/core';
import { getTestBed, MetadataOverride, TestBed, TestBedStatic, TestModuleMetadata } from '@angular/core/testing';

import funcExtractTokens from '../mock-builder/func.extract-tokens';
import getOverrideDef from '../mock-builder/promise/get-override-def';
import { ngMocks } from '../mock-helper/mock-helper';
import mockHelperFasterInstall from '../mock-helper/mock-helper.faster-install';
import { MockProvider } from '../mock-provider/mock-provider';

import coreDefineProperty from './core.define-property';
import { flatten, mapEntries, mapValues } from './core.helpers';
import coreReflectMeta from './core.reflect.meta';
import coreReflectModuleResolve from './core.reflect.module-resolve';
import coreReflectProvidedIn from './core.reflect.provided-in';
import { NG_MOCKS_TOUCHES } from './core.tokens';
import { AnyType } from './core.types';
import funcGetProvider from './func.get-provider';
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

const generateTouchesKey = [
  'bootstrap',
  'declarations',
  'entryComponents',
  'exports',
  'imports',
  'providers',
  'viewProviders',
] as const;

const generateTouches = (
  moduleDef: Partial<TestModuleMetadata & NgModule & Directive & Pipe & Component>,
  touches: Set<any>,
): void => {
  for (const key of generateTouchesKey) {
    for (const item of moduleDef[key] ? flatten(moduleDef[key]) : []) {
      let def = funcGetProvider(item);
      if (isNgModuleDefWithProviders(def)) {
        generateTouches(def, touches);
        def = def.ngModule;
      }
      if (touches.has(def)) {
        continue;
      }
      touches.add(def);
      if (typeof def !== 'function') {
        continue;
      }

      if (!def.hasOwnProperty('__ngMocksTouches')) {
        const local = new Set<any>();
        const meta = coreReflectMeta(def);
        if (meta) {
          generateTouches(meta, local);
        }
        coreDefineProperty(def, '__ngMocksTouches', local, false);
      }

      mapValues(def.__ngMocksTouches, touches);
    }
  }
};

const defineTouches = (testBed: TestBed, moduleDef: TestModuleMetadata, knownTouches?: Set<any>) => {
  let touches = knownTouches;

  if (!touches && ngMocksUniverse.getDefaults().size) {
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
  const ngModule = isNgModuleDefWithProviders(def) ? /* istanbul ignore next */ def.ngModule : def;
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
  (original: TestBedStatic['configureTestingModule']): TestBedStatic['configureTestingModule'] =>
  (moduleDef: TestModuleMetadata) => {
    initTestBed();

    const testBed = getTestBed();

    const providers = funcExtractTokens(moduleDef.providers);
    const { mocks, overrides } = providers;
    // touches are important,
    // therefore we are trying to fetch them from the known providers.
    const touches = defineTouches(testBed, moduleDef, providers.touches);

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

    return original.call(TestBed, moduleDef);
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

const install = () => {
  const hooks = mockHelperFasterInstall();
  // istanbul ignore else
  if (!(TestBed as any).ngMocksOverridesInstalled) {
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

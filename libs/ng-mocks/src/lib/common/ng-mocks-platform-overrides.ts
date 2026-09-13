import { TestBed, TestModuleMetadata } from '@angular/core/testing';

import funcExtractTokens from '../mock-builder/func.extract-tokens';
import getOverrideDef from '../mock-builder/promise/get-override-def';
import { MockProvider } from '../mock-provider/mock-provider';

import coreConfig from './core.config';
import coreDefineProperty from './core.define-property';
import { flatten } from './core.helpers';
import coreReflectMeta from './core.reflect.meta';
import coreReflectProvidedIn from './core.reflect.provided-in';
import { NG_MOCKS_TOUCHES } from './core.tokens';
import { dependencyKeys } from './core.types';
import funcExtractForwardRef from './func.extract-forward-ref';
import funcGetType from './func.get-type';
import { isNgDef } from './func.is-ng-def';
import { isNgModuleDefWithProviders } from './func.is-ng-module-def-with-providers';
import ngMocksUniverse from './ng-mocks-universe';

const generateTouches = (moduleDef: Partial<Record<dependencyKeys, any>>, touches: Set<any>): void => {
  for (const key of coreConfig.dependencies) {
    for (const entry of moduleDef[key] ? flatten(moduleDef[key]) : []) {
      const item = funcExtractForwardRef(entry);
      const def = funcExtractForwardRef(funcGetType(item));
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
        const meta = coreReflectMeta(def);
        // Direct dependencies stay complete when a cycle returns to a declaration still being traversed.
        const local = meta ? flatten(coreConfig.dependencies.map(key => meta[key] || [])) : [];
        coreDefineProperty(def, '__ngMocksTouches', local, false);
      }

      generateTouches({ providers: def.__ngMocksTouches }, touches);
    }
  }
};

export const defineTouches = (testBed: TestBed, moduleDef: TestModuleMetadata, knownTouches?: Set<any>) => {
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

  const original = coreReflectMeta(ngModule);
  if (!original) {
    return;
  }
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
  // eslint-disable-next-line unicorn/no-useless-spread -- Default rules may change while TestBed overrides are applied.
  for (const [provide, [config]] of [...ngMocksUniverse.getDefaults()]) {
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

export const applyPlatformOverrides = (testBed: TestBed, touches: Set<any>) => {
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

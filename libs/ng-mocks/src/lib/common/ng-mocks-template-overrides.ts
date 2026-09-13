import { Component, ExistingProvider } from '@angular/core';
import { getTestBed, MetadataOverride, TestBedStatic } from '@angular/core/testing';

import funcInheritDefinition from '../mock-render/func.inherit-definition';
import helperCreateClone from '../mock-service/helper.create-clone';

import coreDefineProperty from './core.define-property';
import { Type } from './core.types';

type OverrideKey = 'overrideComponent' | 'overrideDirective';
type Override = MetadataOverride<Component>;
type OverrideRecord = [OverrideKey, Override];
type NativeOverrides = Pick<TestBedStatic, OverrideKey>;
type CompileTypes = (() => unknown) & { ngMocksTemplateOverridesPatched?: boolean };
type OverrideTestBed = NativeOverrides & {
  _compiler?: { compileTypesSync?: CompileTypes } | null;
  ngMocksTemplateOverrides?: NativeOverrides;
};
type Middleware = ExistingProvider & { provide: Type<unknown>; useExisting: Type<unknown> };

const overrides = new Map<Type<unknown>, OverrideRecord[]>();
const middleware = new Map<Type<unknown>, Middleware>();

const installCompiler = (instance: OverrideTestBed): void => {
  const compiler = instance._compiler;
  if (!compiler?.compileTypesSync || compiler.compileTypesSync.ngMocksTemplateOverridesPatched) {
    return;
  }
  const original = compiler.compileTypesSync;
  const compile: CompileTypes = helperCreateClone(original, undefined, undefined, () => {
    const result = original.call(compiler);
    // Native overrides replace Ivy getters before scopes and fixtures use them.
    for (const alias of middleware.values()) {
      funcInheritDefinition(alias.useExisting, alias.provide);
    }

    return result;
  });
  coreDefineProperty(compile, 'ngMocksTemplateOverridesPatched', true);
  coreDefineProperty(compiler, 'compileTypesSync', compile, true);
};

const applyOverride = (instance: OverrideTestBed, method: OverrideKey, child: Middleware, override: Override): void => {
  const forwarded = { ...override };
  for (const operation of ['set', 'add', 'remove'] as const) {
    if (override[operation]) {
      forwarded[operation] = { ...override[operation] };
      // The wrapper already binds the middleware's generated selector.
      delete forwarded[operation]!.selector;
    }
  }
  if (forwarded.set && 'providers' in forwarded.set) {
    forwarded.set.providers = [...(forwarded.set.providers ?? []), child];
  }
  instance.ngMocksTemplateOverrides![method].call(instance, child.useExisting, forwarded);
};

export const installTemplateOverrides = (instance: OverrideTestBed): void => {
  if (!instance.ngMocksTemplateOverrides) {
    const original: NativeOverrides = {
      overrideComponent: instance.overrideComponent,
      overrideDirective: instance.overrideDirective,
    };
    coreDefineProperty(instance, 'ngMocksTemplateOverrides', original);
    for (const method of ['overrideComponent', 'overrideDirective'] as const) {
      coreDefineProperty(
        instance,
        method,
        helperCreateClone(original[method], undefined, undefined, (source: Type<unknown>, override: Override) => {
          const result = original[method].call(instance, source, override);
          const history = overrides.get(source) ?? [];
          history.push([method, override]);
          overrides.set(source, history);
          installCompiler(instance);
          const child = middleware.get(source);
          if (child) {
            applyOverride(instance, method, child, override);
          }

          return result;
        }),
        true,
      );
    }
  }
  installCompiler(instance);
};

export const rememberTemplateOverrides = (alias: Middleware): void => {
  const instance = getTestBed();
  installTemplateOverrides(instance);
  middleware.set(alias.provide, alias);
  for (const [method, override] of overrides.get(alias.provide) ?? []) {
    applyOverride(instance, method, alias, override);
  }
};

export const resetTemplateOverrides = (): void => {
  overrides.clear();
  middleware.clear();
};

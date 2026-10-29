import { Component, ExistingProvider, NgModule } from '@angular/core';
import { getTestBed, MetadataOverride, TestBedStatic } from '@angular/core/testing';

import funcInheritDefinition from '../mock-render/func.inherit-definition';
import helperCreateClone from '../mock-service/helper.create-clone';

import coreDefineProperty from './core.define-property';
import { flatten } from './core.helpers';
import coreReflectMeta from './core.reflect.meta';
import { AnyType, Type } from './core.types';
import funcApplyTestBedOverride from './func.apply-test-bed-override';
import funcExtractForwardRef from './func.extract-forward-ref';
import { getSourceOfMock } from './func.get-source-of-mock';
import funcGetType from './func.get-type';
import { isMockNgDef } from './func.is-mock-ng-def';
import { isNgDef } from './func.is-ng-def';

type OverrideKey = 'overrideComponent' | 'overrideDirective' | 'overrideModule';
type Metadata = Component & NgModule & { entryComponents?: Array<Type<unknown>> };
type Override = MetadataOverride<Metadata>;
type OverrideRecord = [OverrideKey, Override];
type NativeOverrides = Pick<TestBedStatic, OverrideKey>;
type CompileTypes = (() => unknown) & { ngMocksTemplateOverridesPatched?: boolean };
type OverrideTestBed = NativeOverrides & {
  _compiler?: { compileTypesSync?: CompileTypes } | null;
  ngMocksTemplateOverrides?: NativeOverrides;
};
type Middleware = ExistingProvider & { provide: Type<unknown>; useExisting: Type<unknown> };

const overrides = new Map<AnyType<unknown>, OverrideRecord[]>();
const middleware = new Map<Type<unknown>, Middleware>();
const moduleAliases = new Map<Type<unknown>, Type<unknown>>();
const dependencyKeys = [
  'imports',
  'declarations',
  'exports',
  'bootstrap',
  'entryComponents',
  'providers',
  'viewProviders',
  'hostDirectives',
  'schemas',
] as const;
const replacements = new Map<
  AnyType<unknown>,
  {
    original: Partial<Metadata>;
    resolved: Partial<Metadata>;
    definitions: Map<unknown, unknown>;
  }
>();
let automatic = false;

const syncMockAnnotations = (source: AnyType<unknown>, metadata: Partial<Metadata>): void => {
  if (!isMockNgDef(source, 'm') && !isMockNgDef(source, 'c') && !isMockNgDef(source, 'd')) {
    return;
  }
  // Generated mocks own their declaration annotation. Older Ivy reads it
  // alongside compiled definitions when verifying imports and entry components.
  const annotation = (source as AnyType<unknown> & { __annotations__: [Metadata] }).__annotations__[0];
  for (const key of dependencyKeys) {
    if (key in metadata) {
      Object.assign(annotation, { [key]: metadata[key] });
    } else {
      delete annotation[key];
    }
  }
};

const translateOverride = (source: AnyType<unknown>, override: Override): Override => {
  const replacement = replacements.get(source);
  if (!replacement || !override.remove) {
    return override;
  }

  let remove = override.remove;
  for (const key of dependencyKeys) {
    if (!remove[key]) {
      continue;
    }
    const original = flatten<unknown>(replacement.original[key] ?? []);
    const resolved = flatten<unknown>(replacement.resolved[key] ?? []);
    const entries = flatten<unknown>(remove[key]);
    const translated = [...entries];
    for (const entry of entries) {
      const mapped = replacement.definitions.get(entry);
      if (original.indexOf(entry) !== -1 && resolved.indexOf(mapped) !== -1 && translated.indexOf(mapped) === -1) {
        translated.push(mapped);
      }
      // Native removal compares references. Only translate an original class
      // or a recorded wrapper, retaining unrelated recipe objects.
      if (typeof entry !== 'function' || original.indexOf(entry) === -1) {
        continue;
      }
      const type = funcExtractForwardRef(entry);
      for (const value of resolved) {
        if (getSourceOfMock(funcGetType(value)) === type && value !== entry && translated.indexOf(value) === -1) {
          translated.push(value);
        }
      }
    }
    remove = { ...remove, [key]: translated };
  }

  return { ...override, remove };
};

const selectDependencyOverride = (override: Override, rewritten: Partial<Metadata>): Override | undefined => {
  const result: Override = {};
  for (const operation of ['set', 'remove', 'add'] as const) {
    const values = override[operation];
    if (!values) {
      continue;
    }
    const selected: Partial<Metadata> = {};
    for (const key of dependencyKeys) {
      if (key in values && key in rewritten) {
        Object.assign(selected, { [key]: values[key] });
      }
    }
    if (Object.keys(selected).length > 0) {
      result[operation] = selected;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
};

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
      overrideModule: instance.overrideModule,
    };
    coreDefineProperty(instance, 'ngMocksTemplateOverrides', original);
    for (const method of ['overrideComponent', 'overrideDirective', 'overrideModule'] as const) {
      coreDefineProperty(
        instance,
        method,
        helperCreateClone(original[method], undefined, undefined, (source: Type<unknown>, override: Override) => {
          const target = method === 'overrideModule' ? (moduleAliases.get(source) ?? source) : source;
          const forwarded = automatic ? override : translateOverride(target, override);
          const result = original[method].call(instance, target, forwarded);
          if (!automatic) {
            const history = overrides.get(source) ?? [];
            history.push([method, override]);
            overrides.set(source, history);
          }
          installCompiler(instance);
          const child = middleware.get(source);
          if (child) {
            applyOverride(instance, method, child, forwarded);
          }

          return result;
        }),
        true,
      );
    }
  }
  installCompiler(instance);
};

export const applyMockOverrides = (
  source: AnyType<unknown>,
  override: Override,
  original: Override,
  replayNative: boolean,
  resolutions: Map<unknown, unknown>,
): void => {
  const instance = getTestBed();
  installTemplateOverrides(instance);
  const previous = automatic;
  automatic = true;
  try {
    const parent = getSourceOfMock(source);
    const existing = replacements.get(source);
    replacements.set(source, {
      ...existing,
      definitions: new Map([...(existing?.definitions ?? []), ...resolutions]),
      original: moduleAliases.get(parent) === source ? existing!.original : { ...existing?.original, ...original.set },
      resolved: { ...existing?.resolved, ...override.set },
    });
    syncMockAnnotations(source, { ...coreReflectMeta(source), ...replacements.get(source)!.resolved });
    funcApplyTestBedOverride(source, override);
    // A generated set override must not erase native declaration changes made
    // before configureTestingModule. Replay only those fields, once and in order.
    const history = replayNative ? [...(overrides.get(source) ?? [])] : [];
    for (const [, native] of history) {
      const selected = selectDependencyOverride(native, override.set!);
      if (selected) {
        funcApplyTestBedOverride(source, translateOverride(source, selected));
      }
    }
  } finally {
    automatic = previous;
  }
};

export const rememberModuleAliases = (mocks: Map<unknown, unknown> | undefined, replayNative: boolean): void => {
  const instance = getTestBed();
  const previous = automatic;
  automatic = true;
  try {
    for (const [source, value] of mocks ?? []) {
      if (!isNgDef(source, 'm') || !isNgDef(value, 'm') || source === value || !(value.prototype instanceof source)) {
        continue;
      }
      // Kept modules can be cloned when dependencies change. Their native
      // overrides still address the original module supplied by the caller.
      moduleAliases.set(source, value);
      const history = overrides.get(source) ?? [];
      overrides.set(source, history);
      overrides.set(value, history);
      replacements.set(value, {
        original: coreReflectMeta(source),
        resolved: coreReflectMeta(value),
        definitions: new Map(
          (source as Type<unknown> & { __ngMocksResolutions?: Map<unknown, unknown> }).__ngMocksResolutions,
        ),
      });
      if (replayNative) {
        for (const [, native] of history) {
          instance.overrideModule(value, translateOverride(value, native));
        }
      }
    }
  } finally {
    automatic = previous;
  }
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
  for (const source of replacements.keys()) {
    syncMockAnnotations(source, coreReflectMeta(source));
  }
  overrides.clear();
  middleware.clear();
  moduleAliases.clear();
  replacements.clear();
};

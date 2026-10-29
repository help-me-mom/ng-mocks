import { ExistingProvider } from '@angular/core';
import { getTestBed, TestBedStatic } from '@angular/core/testing';

import funcInheritDefinition from '../mock-render/func.inherit-definition';
import helperCreateClone from '../mock-service/helper.create-clone';

import coreDefineProperty from './core.define-property';
import coreReflectMeta from './core.reflect.meta';
import { AnyType, MetadataSubstitutions, Type } from './core.types';
import funcApplyTestBedOverride from './func.apply-test-bed-override';
import { rebaseMetadata } from './func.compose-metadata-substitutions';
import { getSourceOfMock } from './func.get-source-of-mock';
import { isMockNgDef } from './func.is-mock-ng-def';
import { isNgDef } from './func.is-ng-def';
import {
  createMetadataFields,
  Metadata,
  MetadataFields,
  metadataDependencyKeys as dependencyKeys,
  Override,
  trackedMetadataOverride,
  translateMetadataOverride,
  untrackedMetadataOverride,
} from './func.metadata-overrides';

type OverrideKey = 'overrideComponent' | 'overrideDirective' | 'overrideModule';
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
const replacements = new Map<
  AnyType<unknown>,
  {
    original: Partial<Metadata>;
    resolved: Partial<Metadata>;
    fields: MetadataFields;
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
          const replacement = replacements.get(target);
          const translated = automatic ? undefined : translateMetadataOverride(override, replacement?.fields);
          let result: ReturnType<NativeOverrides[OverrideKey]> = getTestBed();
          for (const forwarded of translated?.overrides ?? [override]) {
            result = original[method].call(instance, target, forwarded);
            const child = middleware.get(source);
            if (child) {
              applyOverride(instance, method, child, forwarded);
            }
          }
          if (!automatic) {
            if (replacement && translated) {
              replacement.fields = translated.fields;
            }
            const history = overrides.get(source) ?? [];
            history.push([method, override]);
            overrides.set(source, history);
          }
          installCompiler(instance);

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
  substitutions: MetadataSubstitutions,
): void => {
  const instance = getTestBed();
  installTemplateOverrides(instance);
  const previous = automatic;
  automatic = true;
  try {
    const parent = getSourceOfMock(source);
    const existing = replacements.get(source);
    const alias = moduleAliases.get(parent) === source;
    const replacement = {
      original: alias ? existing!.original : { ...existing?.original, ...original.set },
      resolved: { ...existing?.resolved, ...override.set },
      fields: new Map(existing?.fields),
    };
    const contributions = alias
      ? rebaseMetadata(
          (source as AnyType<unknown> & { __ngMocksMetadataSubstitutions: MetadataSubstitutions })
            .__ngMocksMetadataSubstitutions,
          substitutions,
        )
      : substitutions;
    for (const [key, field] of createMetadataFields(replacement.original, override.set!, contributions)) {
      replacement.fields.set(key, field);
    }
    replacements.set(source, replacement);
    syncMockAnnotations(source, { ...coreReflectMeta(source), ...replacement.resolved });
    funcApplyTestBedOverride(source, override);
    // A generated set override must not erase native declaration changes made
    // before configureTestingModule. Replay only those fields, once and in order.
    const history = replayNative ? [...(overrides.get(source) ?? [])] : [];
    for (const [, native] of history) {
      const selected = selectDependencyOverride(native, override.set!);
      if (selected) {
        const translated = translateMetadataOverride(selected, replacement.fields);
        for (const forwarded of translated.overrides) {
          funcApplyTestBedOverride(source, forwarded);
        }
        replacement.fields = translated.fields;
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
      if (
        !isNgDef(source, 'm') ||
        !isNgDef(value, 'm') ||
        source === value ||
        !(value.prototype instanceof source) ||
        !Object.prototype.hasOwnProperty.call(value, '__ngMocksMetadataSubstitutions')
      ) {
        continue;
      }
      // Kept modules can be cloned when dependencies change. Their native
      // overrides still address the original module supplied by the caller.
      moduleAliases.set(source, value);
      const history = overrides.get(source) ?? [];
      overrides.set(source, history);
      overrides.set(value, history);
      const original = coreReflectMeta(source);
      const resolved = coreReflectMeta(value);
      const snapshot = (value as Type<unknown> & { __ngMocksMetadataSubstitutions: MetadataSubstitutions })
        .__ngMocksMetadataSubstitutions;
      const replacement = { original, resolved, fields: createMetadataFields(original, resolved, snapshot) };
      replacements.set(value, replacement);
      if (replayNative) {
        for (const [, native] of history) {
          const translated = translateMetadataOverride(native, replacement.fields);
          for (const forwarded of translated.overrides) {
            instance.overrideModule(value, forwarded);
          }
          replacement.fields = translated.fields;
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
  const fields = replacements.get(alias.provide)?.fields;
  for (const [method, override] of overrides.get(alias.provide) ?? []) {
    const selected = untrackedMetadataOverride(override, fields);
    if (selected) {
      applyOverride(instance, method, alias, selected);
    }
  }
  if (fields) {
    applyOverride(
      instance,
      isNgDef(alias.provide, 'c') ? 'overrideComponent' : 'overrideDirective',
      alias,
      trackedMetadataOverride(fields),
    );
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

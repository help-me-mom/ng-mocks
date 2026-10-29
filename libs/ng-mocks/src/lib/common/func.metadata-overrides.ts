import { Component, NgModule } from '@angular/core';
import * as angularTesting from '@angular/core/testing';
import { MetadataOverride } from '@angular/core/testing';

import { flatten } from './core.helpers';
import { dependencyKeys, MetadataSubstitutions, Type } from './core.types';
import createMetadataMatcher, { MetadataOverriderConstructor } from './func.match-metadata-removals';

export type Metadata = Component & NgModule & { entryComponents?: Array<Type<unknown>> };
export type Override = MetadataOverride<Metadata>;
type Value = { value: unknown; origin?: number };
type Field = { origins: unknown[]; values?: Value[] };
export type MetadataFields = Map<dependencyKeys, Field>;

export const metadataDependencyKeys = [
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

// Avoid static export resolution against Angular 5–6, where the helper is absent.
const overriderApi = 'ɵMetadata' + 'Overrider';
const matchRemovals = createMetadataMatcher(
  (angularTesting as typeof angularTesting & Record<string, MetadataOverriderConstructor | undefined>)[overriderApi],
);

export const createMetadataFields = (
  original: Partial<Metadata>,
  resolved: Partial<Metadata>,
  substitutions: MetadataSubstitutions,
): MetadataFields => {
  const fields: MetadataFields = new Map();
  for (const key of metadataDependencyKeys) {
    const emitted: unknown[] | undefined = resolved[key];
    if (!emitted) {
      continue;
    }
    const origins: unknown[] = original[key] || [];
    const values: Value[] = emitted.map(value => ({ value }));
    // Automatic producers record a group for every emitted dependency field.
    const groups = substitutions[key]!;
    const used = new Set<number>();
    for (const group of groups) {
      let origin = -1;
      for (let position = 0; position < origins.length; position += 1) {
        if (origins[position] === group.original && !used.has(position)) {
          origin = position;
          break;
        }
      }
      if (origin === -1) {
        continue;
      }
      used.add(origin);
      for (const [, emitted] of group.entries) {
        let position = -1;
        for (let index = 0; index < values.length; index += 1) {
          if (values[index].origin === undefined && values[index].value === emitted) {
            position = index;
            break;
          }
        }
        if (position !== -1) {
          values[position].origin = origin;
        }
      }
    }
    // Unpaired outputs keep their actual position and ordinary native semantics.
    fields.set(key, { origins, values });
  }

  return fields;
};

const invalidCombination = (override: Override): boolean => !!override.set && (!!override.add || !!override.remove);

export const untrackedMetadataOverride = (override: Override, fields?: MetadataFields): Override | undefined => {
  if (!fields || invalidCombination(override)) {
    return override;
  }
  const result: Override = {};
  for (const operation of ['set', 'remove', 'add'] as const) {
    const values = override[operation];
    if (!values) {
      continue;
    }
    const selected: Partial<Metadata> = {};
    for (const key of Object.keys(values)) {
      if (!fields.has(key as dependencyKeys)) {
        Object.assign(selected, { [key]: values[key as keyof Metadata] });
      }
    }
    if (Object.keys(selected).length > 0) {
      result[operation] = selected;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
};

const removeValues = (field: Field, requests: unknown[]): Value[] | undefined => {
  const origins = new Set<number>();
  const removed = new Set<Value>();
  // Keep the automatic origin universe stable until a native set or reset.
  // Repeated removals must not broaden into unrelated equal resolved values.
  for (const request of requests) {
    const matched = matchRemovals(field.origins, [request]);
    const known = matched.length > 0 || matchRemovals(flatten<unknown>(field.origins), [request]).length > 0;
    for (let index = 0; index < field.origins.length; index += 1) {
      if (matched.indexOf(field.origins[index]) !== -1) {
        origins.add(index);
      }
    }
    const candidates = (field.values || []).filter(value => !known || value.origin === undefined);
    const actual = matchRemovals(
      candidates.map(value => value.value),
      [request],
    );
    for (const value of candidates) {
      if (actual.indexOf(value.value) !== -1) {
        removed.add(value);
      }
    }
  }

  return field.values?.filter(
    value => (value.origin === undefined || !origins.has(value.origin)) && !removed.has(value),
  );
};

export const trackedMetadataOverride = (fields: MetadataFields): Override => {
  const set: Partial<Metadata> = {};
  for (const [key, field] of fields) {
    Object.assign(set, { [key]: field.values?.map(value => value.value) });
  }

  return { set };
};

export const translateMetadataOverride = (
  override: Override,
  fields?: MetadataFields,
): { overrides: Override[]; fields: MetadataFields } => {
  const next = new Map(fields);
  if (invalidCombination(override)) {
    return { overrides: [override], fields: next };
  }
  const changed: MetadataFields = new Map();
  for (const [key, previous] of next) {
    let field: Field = { ...previous };
    if (override.set && key in override.set) {
      const values: unknown[] | undefined = override.set[key];
      field = { origins: [], values: values?.map(value => ({ value })) };
    } else {
      if (override.remove && key in override.remove) {
        const value = override.remove[key];
        field.values = removeValues(field, Array.isArray(value) ? value : [value]);
      }
      if (override.add && key in override.add) {
        const value = override.add[key];
        if (field.values || value !== undefined) {
          const added: unknown[] = Array.isArray(value) ? value : [value];
          field.values = [...(field.values || []), ...added.map(value => ({ value }))];
        }
      }
      if ((!override.remove || !(key in override.remove)) && (!override.add || !(key in override.add))) {
        continue;
      }
    }
    next.set(key, field);
    changed.set(key, field);
  }
  const overrides: Override[] = [];
  const untouched = untrackedMetadataOverride(override, fields);
  if (untouched) {
    overrides.push(untouched);
  }
  if (changed.size > 0) {
    overrides.push(trackedMetadataOverride(changed));
  }

  return { overrides: overrides.length > 0 ? overrides : [override], fields: next };
};

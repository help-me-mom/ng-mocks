import { Component, Directive, NgModule } from '@angular/core';

import coreReflectMeta from '../../common/core.reflect.meta';
import { MetadataSubstitutions, Type } from '../../common/core.types';
import { composeCachedMetadata } from '../../common/func.compose-metadata-substitutions';
import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import cloneProviders from '../../mock/clone-providers';
import toExistingProvider from '../../mock/to-existing-provider';
import mockNgDef from '../../mock-module/mock-ng-def';

export const getMockOverrideDef = (source: Type<unknown>, mock: Type<unknown>, meta: Component & NgModule) => {
  const declaration = isNgDef(source, 'c') || isNgDef(source, 'd');
  const [, result, , substitutions] = mockNgDef(
    declaration ? { ...meta, providers: [], viewProviders: [], skipExports: true } : meta,
    declaration ? undefined : source,
  );
  if (declaration) {
    const resolver = ngMocksUniverse.config.get('mockNgDefResolver');
    const providers = cloneProviders(source, mock, meta.providers ?? [], resolver);
    const viewProviders = cloneProviders(source, mock, meta.viewProviders ?? [], resolver);
    const own = toExistingProvider(source, mock);
    result.providers = [...providers.providers, own];
    result.viewProviders = viewProviders.providers;
    substitutions.providers = [...providers.substitutions, { original: source, entries: [[source, own]] }];
    substitutions.viewProviders = viewProviders.substitutions;
  }
  // Native overrides can address entries captured in the supplied mock before
  // current keep/exclude choices changed. Compose that artifact's snapshot.
  const previous = (mock as Type<unknown> & { __ngMocksMetadataSubstitutions: MetadataSubstitutions })
    .__ngMocksMetadataSubstitutions;

  return { def: result, substitutions: composeCachedMetadata(coreReflectMeta(mock), previous, substitutions) };
};

export default (meta?: Directive | NgModule) => {
  if (!meta) {
    return undefined;
  }

  const skipMock = ngMocksUniverse.flags.has('skipMock');
  // istanbul ignore else
  if (!skipMock) {
    ngMocksUniverse.flags.add('skipMock');
  }
  const [changed, def, , substitutions] = mockNgDef(meta);
  // istanbul ignore else
  if (!skipMock) {
    ngMocksUniverse.flags.delete('skipMock');
  }
  if (!changed) {
    return undefined;
  }

  return { def, substitutions };
};

import { Component, Directive, NgModule } from '@angular/core';

import { Type } from '../../common/core.types';
import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import cloneProviders from '../../mock/clone-providers';
import toExistingProvider from '../../mock/to-existing-provider';
import mockNgDef from '../../mock-module/mock-ng-def';

export const getMockOverrideDef = (source: Type<unknown>, mock: Type<unknown>, meta: Component & NgModule) => {
  const declaration = isNgDef(source, 'c') || isNgDef(source, 'd');
  const [, result, resolutions] = mockNgDef(
    declaration ? { ...meta, providers: [], viewProviders: [], skipExports: true } : meta,
    declaration ? undefined : source,
  );
  if (declaration) {
    const resolver = ngMocksUniverse.config.get('mockNgDefResolver');
    result.providers = [
      ...cloneProviders(source, mock, meta.providers ?? [], resolver).providers,
      toExistingProvider(source, mock),
    ];
    result.viewProviders = cloneProviders(source, mock, meta.viewProviders ?? [], resolver).providers;
  }

  return { def: result, resolutions };
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
  const [changed, def, resolutions] = mockNgDef(meta);
  // istanbul ignore else
  if (!skipMock) {
    ngMocksUniverse.flags.delete('skipMock');
  }
  if (!changed) {
    return undefined;
  }

  return { def, resolutions };
};

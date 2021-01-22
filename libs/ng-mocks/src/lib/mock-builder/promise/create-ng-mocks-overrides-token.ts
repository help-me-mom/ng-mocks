import { NgModule, ValueProvider } from '@angular/core';
import { MetadataOverride } from '@angular/core/testing';

import { mapValues } from '../../common/core.helpers';
import { NG_MOCKS_OVERRIDES } from '../../common/core.tokens';
import { Type } from '../../common/core.types';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import getOverrideDef from './get-override-def';
import getOverrideMeta from './get-override-meta';
import skipOverride from './skip-override';

export default (replaceDef: Set<any>, defValue: Map<any, any>): ValueProvider => {
  const overrides: Map<Type<any>, MetadataOverride<any>> = new Map();
  for (const proto of mapValues(ngMocksUniverse.touches)) {
    const source: any = proto;
    const value = ngMocksUniverse.getBuildDeclaration(source) || source;
    if (skipOverride(replaceDef, defValue, source, value)) {
      continue;
    }

    const def = getOverrideDef(getOverrideMeta(value));
    if (!def) {
      continue;
    }
    const override: MetadataOverride<NgModule> = {
      set: def,
    };
    overrides.set(value, override);
  }

  return {
    provide: NG_MOCKS_OVERRIDES,
    useValue: overrides,
  };
};

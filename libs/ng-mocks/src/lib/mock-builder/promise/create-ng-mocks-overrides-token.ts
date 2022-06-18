import { ValueProvider } from '@angular/core';
import { MetadataOverride } from '@angular/core/testing';

import { mapValues } from '../../common/core.helpers';
import coreReflectMeta from '../../common/core.reflect.meta';
import { NG_MOCKS_OVERRIDES } from '../../common/core.tokens';
import { Type } from '../../common/core.types';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import getOverrideDef from './get-override-def';
import skipOverride from './skip-override';

export default (replaceDef: Set<any>, defValue: Map<any, any>): ValueProvider => {
  const overrides: Map<Type<any>, [MetadataOverride<any>, MetadataOverride<any>]> = new Map();
  for (const proto of mapValues(ngMocksUniverse.touches)) {
    const source: any = proto;
    const value = ngMocksUniverse.getBuildDeclaration(source) || source;
    if (skipOverride(replaceDef, defValue, source, value)) {
      continue;
    }

    const original = coreReflectMeta(value);
    const override = getOverrideDef(original);
    if (!override) {
      continue;
    }

    // We need to delete standalone, because Angular was too lazy to check whether it has been really changed.
    const patchedOriginal: Partial<typeof original> = {};
    for (const key of Object.keys(override)) {
      patchedOriginal[key] = original[key];
    }

    overrides.set(value, [{ set: override }, { set: patchedOriginal }]);
  }

  return {
    provide: NG_MOCKS_OVERRIDES,
    useValue: overrides,
  };
};

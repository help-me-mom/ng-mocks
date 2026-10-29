import { ValueProvider } from '@angular/core';

import coreReflectMeta from '../../common/core.reflect.meta';
import { NG_MOCKS_OVERRIDES } from '../../common/core.tokens';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import { NgMocksOverrides } from '../func.extract-tokens';

import getOverrideDef from './get-override-def';
import skipOverride from './skip-override';

export default (replaceDef: Set<any>, defValue: Map<any, any>): ValueProvider => {
  const overrides: NgMocksOverrides = new Map();
  // eslint-disable-next-line unicorn/no-useless-spread -- getOverrideDef can add dependencies to the touches set.
  for (const proto of [...ngMocksUniverse.touches]) {
    const source: any = proto;
    const value = ngMocksUniverse.getBuildDeclaration(source) || source;
    if (skipOverride(replaceDef, defValue, source, value)) {
      continue;
    }

    const original = coreReflectMeta(value);
    const selected = ngMocksUniverse.config.get(source)?.__ngMocksMock === value;
    const definition =
      selected && original ? ngMocksUniverse.configInstance.get(source).__ngMocksOverride : getOverrideDef(original);
    if (!definition) {
      continue;
    }
    const { def: override, substitutions } = definition;

    // We need to delete standalone, because Angular was too lazy to check whether it has been really changed.
    const patchedOriginal: Partial<typeof original> = {};
    for (const key of Object.keys(override)) {
      patchedOriginal[key] = original[key];
    }

    overrides.set(value, [{ set: override }, { set: patchedOriginal }, substitutions]);
  }

  return {
    provide: NG_MOCKS_OVERRIDES,
    useValue: overrides,
  };
};

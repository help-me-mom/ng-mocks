import { mapValues } from '../../common/core.helpers';
import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import { BuilderData, NgMeta } from './types';

export default (ngModule: NgMeta, { mockDef, configDef }: BuilderData): void => {
  // Adding missed mock providers to test bed.
  for (const def of mapValues(mockDef)) {
    if (!isNgDef(def, 'i') && isNgDef(def)) {
      continue;
    }

    if (ngMocksUniverse.touches.has(def)) {
      continue;
    }

    const config = configDef.get(def);
    if (config && config.dependency) {
      continue;
    }

    const mock = ngMocksUniverse.builtProviders.get(def);
    ngModule.providers.push(mock);
    ngMocksUniverse.touches.add(def);
  }
};

import { mapValues } from '../../common/core.helpers';
import { isNgDef } from '../../common/func.is-ng-def';
import { isNgInjectionToken } from '../../common/func.is-ng-injection-token';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import { BuilderData, NgMeta } from './types';

export default (ngModule: NgMeta, { keepDef, configDef }: BuilderData): void => {
  // Adding missed kept providers to test bed.
  for (const def of mapValues(keepDef)) {
    if (isNgDef(def, 'm') && !ngModule.imports.includes(def)) {
      ngModule.imports = ngModule.imports.concat(ngMocksUniverse.cacheDeclarations.get(def));
    }

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

    if (isNgInjectionToken(def)) {
      ngMocksUniverse.touches.add(def);
      continue;
    }
    ngModule.providers.push(def);
    ngMocksUniverse.touches.add(def);
  }
};

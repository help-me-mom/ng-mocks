import { mapValues } from '../../common/core.helpers';
import { isNgInjectionToken } from '../../common/func.is-ng-injection-token';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import addMissingDefinition from './add-missing-definition';
import { BuilderData, NgMeta } from './types';

export default (ngModule: NgMeta, { keepDef, configDef }: BuilderData): void => {
  // Adding missed kept providers to test bed.
  for (const def of mapValues(keepDef)) {
    if (addMissingDefinition(def, configDef)) {
      continue;
    }

    if (isNgInjectionToken(def) || typeof def === 'string') {
      ngMocksUniverse.touches.add(def);
      continue;
    }
    ngModule.providers.push(def);
    ngMocksUniverse.touches.add(def);
  }
};

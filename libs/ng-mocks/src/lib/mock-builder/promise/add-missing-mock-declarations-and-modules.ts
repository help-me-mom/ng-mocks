import { mapValues } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import addMissingDefinition from './add-missing-definition';
import { BuilderData, NgMeta } from './types';

export default (ngModule: NgMeta, { mockDef, configDef }: BuilderData): void => {
  // Adding missed mock providers to test bed.
  for (const def of mapValues(mockDef)) {
    if (addMissingDefinition(def, configDef)) {
      continue;
    }

    const mock = ngMocksUniverse.builtProviders.get(def);
    ngModule.providers.push(mock);
    ngMocksUniverse.touches.add(def);
  }
};

import { flatten, mapValues } from '../../common/core.helpers';
import funcGetProvider from '../../common/func.get-provider';
import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import initModule from './init-module';
import skipInitModule from './skip-init-module';
import { BuilderData, NgMeta } from './types';

const handleDef = ({ imports, declarations }: NgMeta, def: any, defProviders: Map<any, any>): void => {
  if (isNgDef(def, 'm')) {
    const extendedDef = initModule(def, defProviders);
    imports.push(extendedDef);

    // adding providers to touches
    if (typeof extendedDef === 'object' && extendedDef.providers) {
      for (const provider of flatten(extendedDef.providers)) {
        ngMocksUniverse.touches.add(funcGetProvider(provider));
      }
    }
  } else {
    declarations.push(ngMocksUniverse.getBuildDeclaration(def));
  }

  ngMocksUniverse.touches.add(def);
};

export default ({ configDef, keepDef, mockDef, replaceDef }: BuilderData, defProviders: Map<any, any>): NgMeta => {
  const meta: NgMeta = { imports: [], declarations: [], providers: [] };

  // Adding suitable leftovers.
  for (const def of [...mapValues(mockDef), ...mapValues(keepDef), ...mapValues(replaceDef)]) {
    if (skipInitModule(def, configDef)) {
      continue;
    }
    handleDef(meta, def, defProviders);
  }

  return meta;
};

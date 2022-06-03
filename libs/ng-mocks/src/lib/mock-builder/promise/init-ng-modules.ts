import { flatten, mapValues } from '../../common/core.helpers';
import funcGetProvider from '../../common/func.get-provider';
import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import markProviders from '../../mock-module/mark-providers';

import initModule from './init-module';
import { BuilderData, NgMeta } from './types';

const handleDef = ({ imports, declarations, providers }: NgMeta, def: any, defProviders: Map<any, any>): void => {
  let touched = false;

  if (isNgDef(def, 'm')) {
    const extendedDef = initModule(def, defProviders);
    imports.push(extendedDef);

    // adding providers to touches
    if (typeof extendedDef === 'object' && extendedDef.providers) {
      for (const provider of flatten(extendedDef.providers)) {
        ngMocksUniverse.touches.add(funcGetProvider(provider));
      }
    }
    touched = true;
  }

  if (isNgDef(def, 'c') || isNgDef(def, 'd') || isNgDef(def, 'p')) {
    declarations.push(ngMocksUniverse.getBuildDeclaration(def));
    touched = true;
  }

  if (isNgDef(def, 'i') || isNgDef(def, 't') || typeof def === 'string') {
    const mock = ngMocksUniverse.builtProviders.get(def);
    if (mock && typeof mock !== 'string' && isNgDef(mock, 't') === false) {
      providers.push(mock);
    }
    touched = true;
  }

  if (touched) {
    ngMocksUniverse.touches.add(def);
  }
};

export default ({ configDef, keepDef, mockDef, replaceDef }: BuilderData, defProviders: Map<any, any>): NgMeta => {
  const meta: NgMeta = { imports: [], declarations: [], providers: [] };

  // Adding suitable leftovers.
  for (const def of [...mapValues(mockDef), ...mapValues(keepDef), ...mapValues(replaceDef)]) {
    const configInstance = ngMocksUniverse.configInstance.get(def);
    const config = configDef.get(def);

    if (!config?.dependency && config?.export && !configInstance?.exported && (isNgDef(def, 'i') || !isNgDef(def))) {
      handleDef(meta, def, defProviders);
      markProviders([def]);
    } else if (!ngMocksUniverse.touches.has(def) && !config?.dependency) {
      handleDef(meta, def, defProviders);
    }
  }

  return meta;
};

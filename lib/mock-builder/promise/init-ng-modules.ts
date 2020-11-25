import { mapValues } from '../../common/core.helpers';
import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import initModule from './init-module';
import skipInitModule from './skip-init-module';
import { BuilderData, NgMeta } from './types';

export default ({ configDef, keepDef, mockDef, replaceDef }: BuilderData, defProviders: Map<any, any>): NgMeta => {
  const { imports, declarations, providers }: NgMeta = { imports: [], declarations: [], providers: [] };

  // Adding suitable leftovers.
  for (const def of [...mapValues(mockDef), ...mapValues(keepDef), ...mapValues(replaceDef)]) {
    if (skipInitModule(def, configDef)) {
      continue;
    }

    if (isNgDef(def, 'm')) {
      imports.push(initModule(def, defProviders));
    } else {
      declarations.push(ngMocksUniverse.builtDeclarations.get(def));
    }

    ngMocksUniverse.touches.add(def);
  }

  return {
    declarations,
    imports,
    providers,
  };
};

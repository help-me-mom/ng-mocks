import { mapValues } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (keepDef: Set<any>): void => {
  for (const def of mapValues(keepDef)) {
    ngMocksUniverse.builtDeclarations.set(def, def);
    ngMocksUniverse.builtProviders.set(def, def);
    ngMocksUniverse.config.get('ngMocksDepsResolution').set(def, 'keep');
  }
};

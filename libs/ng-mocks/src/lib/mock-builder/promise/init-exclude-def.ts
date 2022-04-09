import { mapValues } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (excludeDef: Set<any>): void => {
  for (const def of mapValues(excludeDef)) {
    ngMocksUniverse.builtDeclarations.set(def, null);
    ngMocksUniverse.builtProviders.set(def, null);
    ngMocksUniverse.config.get('ngMocksDepsResolution').set(def, 'exclude');
  }
};

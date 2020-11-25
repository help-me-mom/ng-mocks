import { mapValues } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (replaceDef: Set<any>, defValue: Map<any, any>): void => {
  for (const def of mapValues(replaceDef)) {
    ngMocksUniverse.builtDeclarations.set(def, defValue.get(def));
    ngMocksUniverse.config.get('resolution').set(def, 'replace');
  }
};

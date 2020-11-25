import { mapValues } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import tryMockDeclaration from './try-mock-declaration';
import tryMockProvider from './try-mock-provider';

export default (mockDef: Set<any>, defValue: Map<any, any>): void => {
  for (const def of mapValues(mockDef)) {
    ngMocksUniverse.config.get('resolution').set(def, 'mock');
    tryMockDeclaration(def, defValue);
    tryMockProvider(def, defValue);

    ngMocksUniverse.touches.delete(def);
  }
};

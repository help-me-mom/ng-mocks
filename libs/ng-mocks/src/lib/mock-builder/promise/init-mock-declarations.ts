import { mapValues } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import tryMockProvider from './try-mock-provider';

export default (mockDef: Set<any>, defValue: Map<any, any>): void => {
  const builtDeclarations = ngMocksUniverse.builtDeclarations;
  const resolutions: Map<any, string> = ngMocksUniverse.config.get('ngMocksDepsResolution');
  for (const def of mapValues(mockDef)) {
    const deleteTouch = !ngMocksUniverse.touches.has(def);

    resolutions.set(def, 'mock');
    builtDeclarations.set(def, undefined);
    tryMockProvider(def, defValue);

    if (deleteTouch) {
      ngMocksUniverse.touches.delete(def);
    }
  }
};

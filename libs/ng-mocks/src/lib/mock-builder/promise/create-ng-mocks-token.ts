import { ValueProvider } from '@angular/core';

import { NG_MOCKS } from '../../common/core.tokens';
import { getNgType } from '../../common/func.get-ng-type';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (): ValueProvider => {
  const mocks = new Map();
  for (const declarations of [
    ngMocksUniverse.builtProviders,
    ngMocksUniverse.builtDeclarations,
    ngMocksUniverse.cacheDeclarations,
    ngMocksUniverse.cacheProviders,
  ]) {
    for (const [key, value] of declarations) {
      if (mocks.has(key)) {
        if (declarations !== ngMocksUniverse.builtDeclarations) {
          continue;
        }

        // An injectable declaration needs its class here, rather than its provider recipe.
        // Provider-only definitions keep their existing recipes and exclusion sentinels.
        const ngType = getNgType(key);
        if (!ngType || ngType === 'Injectable') {
          continue;
        }
      }
      mocks.set(key, value);
    }
  }

  return {
    provide: NG_MOCKS,
    useValue: mocks,
  };
};

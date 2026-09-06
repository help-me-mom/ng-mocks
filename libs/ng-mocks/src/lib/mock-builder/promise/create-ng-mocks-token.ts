import { ValueProvider } from '@angular/core';

import { NG_MOCKS } from '../../common/core.tokens';
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
        continue;
      }
      mocks.set(key, value);
    }
  }

  return {
    provide: NG_MOCKS,
    useValue: mocks,
  };
};

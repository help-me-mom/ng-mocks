import { ValueProvider } from '@angular/core';

import { mapEntries } from '../../common/core.helpers';
import { NG_MOCKS } from '../../common/core.tokens';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (): ValueProvider => {
  const mocks = new Map();
  for (const [key, value] of [
    ...mapEntries(ngMocksUniverse.builtProviders),
    ...mapEntries(ngMocksUniverse.builtDeclarations),
    ...mapEntries(ngMocksUniverse.cacheDeclarations),
    ...mapEntries(ngMocksUniverse.cacheProviders),
  ]) {
    if (mocks.has(key)) {
      continue;
    }
    mocks.set(key, value);
  }

  return {
    provide: NG_MOCKS,
    useValue: mocks,
  };
};

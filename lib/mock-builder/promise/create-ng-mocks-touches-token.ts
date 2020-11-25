import { ValueProvider } from '@angular/core';

import { mapValues } from '../../common/core.helpers';
import { NG_MOCKS_TOUCHES } from '../../common/core.tokens';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (): ValueProvider => {
  // Redefining providers for kept declarations.
  const touches = new Set();
  for (const proto of mapValues(ngMocksUniverse.touches)) {
    const source: any = proto;
    let value = ngMocksUniverse.builtDeclarations.get(source);

    // kept declarations should be based on their source.
    if (value === undefined) {
      value = source;
    }

    touches.add(source);
    touches.add(value);
  }

  return {
    provide: NG_MOCKS_TOUCHES,
    useValue: touches,
  };
};

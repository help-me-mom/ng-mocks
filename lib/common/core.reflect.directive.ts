import { MockDirectiveResolver } from '@angular/compiler/testing';

import coreReflectJit from './core.reflect.jit';
import ngMocksUniverse from './ng-mocks-universe';

export default (): MockDirectiveResolver => {
  if (!ngMocksUniverse.global.has(MockDirectiveResolver)) {
    ngMocksUniverse.global.set(MockDirectiveResolver, new MockDirectiveResolver(coreReflectJit()));
  }

  return ngMocksUniverse.global.get(MockDirectiveResolver);
};

import { MockPipeResolver } from '@angular/compiler/testing';

import coreReflectJit from './core.reflect.jit';
import ngMocksUniverse from './ng-mocks-universe';

export default (): MockPipeResolver => {
  if (!ngMocksUniverse.global.has(MockPipeResolver)) {
    ngMocksUniverse.global.set(MockPipeResolver, new MockPipeResolver(coreReflectJit()));
  }

  return ngMocksUniverse.global.get(MockPipeResolver);
};

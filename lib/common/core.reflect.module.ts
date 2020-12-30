import { MockNgModuleResolver } from '@angular/compiler/testing';

import coreReflectJit from './core.reflect.jit';
import ngMocksUniverse from './ng-mocks-universe';

export default (): MockNgModuleResolver => {
  if (!ngMocksUniverse.global.has(MockNgModuleResolver)) {
    ngMocksUniverse.global.set(MockNgModuleResolver, new MockNgModuleResolver(coreReflectJit()));
  }

  return ngMocksUniverse.global.get(MockNgModuleResolver);
};

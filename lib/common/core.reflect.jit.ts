import { JitReflector } from './jit-reflector';
import ngMocksUniverse from './ng-mocks-universe';

export default (): JitReflector => {
  if (!ngMocksUniverse.global.has(JitReflector)) {
    ngMocksUniverse.global.set(JitReflector, new JitReflector());
  }

  return ngMocksUniverse.global.get(JitReflector);
};

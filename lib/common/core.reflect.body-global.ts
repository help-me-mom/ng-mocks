import coreReflectJit from './core.reflect.jit';
import { Type } from './core.types';
import ngMocksUniverse from './ng-mocks-universe';

export default <T>(type: Type<T>) => (): T => {
  if (!ngMocksUniverse.global.has(type)) {
    ngMocksUniverse.global.set(type, new type(coreReflectJit()));
  }

  return ngMocksUniverse.global.get(type);
};

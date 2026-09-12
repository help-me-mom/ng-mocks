import helperDefinePropertyDescriptor from './helper.define-property-descriptor';
import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';
import helperMockService from './helper.mock-service';

const shouldSkipKey = (key: string | symbol): boolean => {
  if (typeof key === 'symbol') {
    return false;
  }

  return key.startsWith('__') || key.startsWith('ngMocksRender_');
};

export default (seed: any, target: any): void => {
  if (!seed || !target || seed === target) {
    return;
  }

  // Copy configurable own descriptors so spies, getters, and ad-hoc stubs keep their identity when
  // Angular later creates a different local declaration instance.
  for (const key of [...Object.getOwnPropertyNames(seed), ...Object.getOwnPropertySymbols(seed)]) {
    if (shouldSkipKey(key)) {
      continue;
    }

    const descriptor = helperExtractPropertyDescriptor(seed, key);
    if (!descriptor || descriptor.configurable === false) {
      continue;
    }

    const getter = descriptor.get as ((() => unknown) & { __ngMocksGet?: unknown }) | undefined;
    const setter = descriptor.set as (((value: unknown) => void) & { __ngMocksSet?: unknown }) | undefined;
    if (typeof getter?.__ngMocksGet === 'function' && typeof setter?.__ngMocksSet === 'function') {
      // Generated accessors keep their value in a closure. Replay its current value into a fresh
      // pair, while deliberately replaced getters or setters retain their exact function identity.
      const accessors = {};
      descriptor.get = helperMockService.mock(accessors, String(key), 'get');
      descriptor.set = helperMockService.mock(accessors, String(key), 'set');
      descriptor.set!(getter!());
    }

    helperDefinePropertyDescriptor(target, key, descriptor);
  }
};

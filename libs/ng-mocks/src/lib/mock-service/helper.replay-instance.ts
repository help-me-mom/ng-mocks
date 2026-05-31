import helperDefinePropertyDescriptor from './helper.define-property-descriptor';
import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';

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

    helperDefinePropertyDescriptor(target, key, descriptor);
  }
};

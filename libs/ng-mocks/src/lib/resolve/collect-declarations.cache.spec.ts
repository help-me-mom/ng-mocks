import coreDefineProperty from '../common/core.define-property';
import funcGetGlobal from '../common/func.get-global';

import collectDeclarations from './collect-declarations';

describe('collect-declarations:cache', () => {
  let reflectionOverride: PropertyDescriptor | undefined;

  beforeEach(() => {
    reflectionOverride = Object.getOwnPropertyDescriptor(
      funcGetGlobal(),
      '__ngMocksReflectComponentType',
    );
  });

  afterEach(() => {
    if (reflectionOverride) {
      Object.defineProperty(
        funcGetGlobal(),
        '__ngMocksReflectComponentType',
        reflectionOverride,
      );
    } else {
      delete funcGetGlobal().__ngMocksReflectComponentType;
    }
  });

  it('does not permanently cache a def as parsed when a parsing step throws', () => {
    const def = { ɵcmp: { inputs: { value: 'value' } } };
    coreDefineProperty(
      funcGetGlobal(),
      '__ngMocksReflectComponentType',
      () => {
        throw new Error('boom');
      },
    );

    expect(() => collectDeclarations(def)).toThrow();

    coreDefineProperty(
      funcGetGlobal(),
      '__ngMocksReflectComponentType',
      false,
    );
    const actual = collectDeclarations(def);

    expect(actual.inputs).toEqual(['value']);
  });
});

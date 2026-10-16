import coreDefineProperty from '../common/core.define-property';
import funcGetGlobal from '../common/func.get-global';

import collectDeclarations from './collect-declarations';

describe('collect-declarations:reflection', () => {
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

  it('enriches ng def inputs with reflected signal metadata', () => {
    coreDefineProperty(
      funcGetGlobal(),
      '__ngMocksReflectComponentType',
      () => ({
        inputs: [
          {
            isSignal: true,
            propName: 'value',
            templateName: 'alias',
          },
        ],
        outputs: [],
      }),
    );
    const actual = collectDeclarations({
      ɵcmp: {
        declaredInputs: { alias: 'value' },
        inputs: { alias: ['value', 0, null] },
      },
    });

    expect(actual.inputs).toEqual([
      { name: 'value', alias: 'alias', isSignal: true },
    ]);
  });
});

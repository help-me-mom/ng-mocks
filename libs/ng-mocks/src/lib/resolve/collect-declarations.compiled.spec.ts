import coreDefineProperty from '../common/core.define-property';
import funcGetGlobal from '../common/func.get-global';

import collectDeclarations from './collect-declarations';

describe('collect-declarations:compiled bindings', () => {
  let reflectionOverride: PropertyDescriptor | undefined;

  beforeEach(() => {
    reflectionOverride = Object.getOwnPropertyDescriptor(
      funcGetGlobal(),
      '__ngMocksReflectComponentType',
    );
    coreDefineProperty(
      funcGetGlobal(),
      '__ngMocksReflectComponentType',
      false,
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

  it('reads signal model bindings from ng defs', () => {
    const actual = collectDeclarations({
      ɵcmp: {
        declaredInputs: { value: 'value' },
        inputs: { value: ['value', 1, String] },
        outputs: { valueChange: 'value' },
        standalone: true,
      },
    });

    expect(actual.inputs).toEqual([
      { name: 'value', isSignal: true, transform: String },
    ]);
    expect(actual.outputs).toEqual(['value:valueChange']);
    expect(actual.standalone).toBe(true);
  });

  it('reads string-form ng def inputs without declaredInputs', () => {
    const actual = collectDeclarations({
      ɵcmp: { inputs: { alias: 'prop' } },
    });

    expect(actual.inputs).toEqual(['prop:alias']);
    expect(actual.outputs).toEqual([]);
  });

  it('reads ng def outputs without inputs', () => {
    const actual = collectDeclarations({
      ɵcmp: { outputs: { valueChange: 'value' } },
    });

    expect(actual.inputs).toEqual([]);
    expect(actual.outputs).toEqual(['value:valueChange']);
  });
});

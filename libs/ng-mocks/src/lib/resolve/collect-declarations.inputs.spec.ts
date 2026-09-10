import funcGetGlobal from '../common/func.get-global';

import collectDeclarations from './collect-declarations';

describe('collect-declarations:inputs', () => {
  afterEach(() => {
    delete funcGetGlobal().__ngMocksReflectComponentType;
  });

  it('uses the effective compiled transform while retaining explicit required metadata', () => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
    const inputs = [
      { name: 'value', required: true, transform: String },
    ];
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Component', inputs }],
      ɵcmp: {
        declaredInputs: { value: 'value' },
        inputs: { value: ['value', 0, Number] },
      },
    });

    expect(actual.Component.inputs).toEqual([
      { name: 'value', required: true, transform: Number },
    ]);
    expect(actual.Component.inputs).not.toBe(inputs);
    expect(inputs).toEqual([
      { name: 'value', required: true, transform: String },
    ]);
  });

  it('removes a class input transform when the effective compiled binding has none', () => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
    const inputs = [{ name: 'value', transform: String }];
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Component', inputs }],
      ɵcmp: {
        declaredInputs: { value: 'value' },
        inputs: { value: ['value', 0, null] },
      },
    });

    expect(actual.Component.inputs).toEqual(['value']);
    expect(actual.Component.inputs).not.toBe(inputs);
    expect(inputs).toEqual([{ name: 'value', transform: String }]);
  });

  it('preserves legacy directive transforms stored by the compiled runtime field name', () => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
    const inputs = [
      { name: 'value', alias: 'publicValue', transform: Number },
    ];
    const inputTransforms = { a: Number };
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Directive', inputs }],
      ɵdir: {
        declaredInputs: { publicValue: 'value' },
        inputs: { publicValue: 'a' },
        inputTransforms,
      },
    });

    expect(actual.Directive.inputs).toEqual([
      { name: 'value', alias: 'publicValue', transform: Number },
    ]);
    expect(actual.Directive.inputs).not.toBe(inputs);
    expect(inputs).toEqual([
      { name: 'value', alias: 'publicValue', transform: Number },
    ]);
    expect(inputTransforms).toEqual({ a: Number });
  });

  it('deduplicates formatted input aliases without modifying their annotation array', () => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
    const inputs = ['value : publicValue'];
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Component', inputs }],
      ɵcmp: {
        declaredInputs: { publicValue: 'value' },
        inputs: { publicValue: 'value' },
      },
    });

    expect(actual.Component.inputs).toEqual(['value : publicValue']);
    expect(actual.Component.inputs).not.toBe(inputs);
    expect(inputs).toEqual(['value : publicValue']);
  });

  it('enriches existing input metadata with signal flags and transforms while preserving required', () => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
    const inputs = [
      { name: 'value', alias: 'publicValue', required: true },
    ];
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Component', inputs }],
      ɵcmp: {
        declaredInputs: { publicValue: 'value' },
        inputs: { publicValue: ['value', 1, String] },
      },
    });

    expect(actual.Component.inputs).toEqual([
      {
        name: 'value',
        alias: 'publicValue',
        required: true,
        isSignal: true,
        transform: String,
      },
    ]);
    expect(inputs).toEqual([
      { name: 'value', alias: 'publicValue', required: true },
    ]);
  });

  it('uses explicit class input names when an older compiler reports the alias as the declared name', () => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
    const actual = collectDeclarations({
      __annotations__: [
        {
          ngMetadataName: 'Component',
          inputs: ['value : publicValue'],
        },
      ],
      ɵcmp: {
        declaredInputs: { publicValue: 'publicValue' },
        inputs: { publicValue: 'value' },
      },
    });

    expect(actual.inputs).toEqual(['value:publicValue']);
    expect(actual.Component.inputs).toEqual(['value : publicValue']);
  });

  it('prefers an effective compiled field over a stale class input annotation', () => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
    const inputs = ['original : publicValue'];
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Component', inputs }],
      ɵcmp: {
        declaredInputs: { publicValue: 'effective' },
        inputs: { publicValue: 'a' },
      },
    });

    expect(actual.inputs).toEqual(['effective:publicValue']);
    expect(actual.Component.inputs).toEqual([
      'original : publicValue',
      'effective:publicValue',
    ]);
    expect(inputs).toEqual(['original : publicValue']);
  });

  it('preserves an unaliased compiled override when the original annotation names another field', () => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
    const inputs = ['original : publicValue'];
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Directive', inputs }],
      ɵdir: {
        declaredInputs: { publicValue: 'publicValue' },
        inputs: { publicValue: 'publicValue' },
      },
    });

    expect(actual.inputs).toEqual(['publicValue']);
    expect(actual.Directive.inputs).toEqual([
      'original : publicValue',
      'publicValue',
    ]);
    expect(inputs).toEqual(['original : publicValue']);
  });

  it('uses the compiled field when declared input metadata is absent and the annotation is stale', () => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
    const inputs = ['original : publicValue'];
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Directive', inputs }],
      ɵdir: {
        inputs: { publicValue: 'effective' },
      },
    });

    expect(actual.inputs).toEqual(['effective:publicValue']);
    expect(actual.Directive.inputs).toEqual([
      'original : publicValue',
      'effective:publicValue',
    ]);
    expect(inputs).toEqual(['original : publicValue']);
  });

  it('retains declared input names when a minified field has no explicit class binding', () => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Directive' }],
      ɵdir: {
        declaredInputs: { publicValue: 'value' },
        inputs: { publicValue: 'a' },
      },
    });

    expect(actual.inputs).toEqual(['value:publicValue']);
    expect(actual.Directive.inputs).toEqual(['value:publicValue']);
  });
});

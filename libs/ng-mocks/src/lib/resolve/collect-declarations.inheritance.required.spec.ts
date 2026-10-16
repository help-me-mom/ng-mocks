import coreDefineProperty from '../common/core.define-property';
import funcGetGlobal from '../common/func.get-global';

import collectDeclarations from './collect-declarations';

describe('collect-declarations:inherited required inputs', () => {
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

  it('inherits required metadata without an own child definition', () => {
    class Parent {}
    class Child extends Parent {}

    coreDefineProperty(Parent, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Parent, '__prop__metadata__', {
      value: [
        {
          ngMetadataName: 'Input',
          required: true,
          transform: Number,
        },
      ],
    });
    coreDefineProperty(Parent, 'ɵdir', {
      declaredInputs: { value: 'value' },
      inputs: { value: ['value', 0, Number] },
    });

    const actual = collectDeclarations(Child);

    expect(actual.inputs).toEqual([
      { name: 'value', required: true, transform: Number },
    ]);
    expect(actual.Directive.inputs).toEqual(actual.inputs);
    expect(collectDeclarations(Parent).inputs).toEqual([
      { name: 'value', required: true, transform: Number },
    ]);
  });

  it('preserves inherited required metadata when only compiled child metadata repeats the input', () => {
    class Parent {}
    class Child extends Parent {}

    const definition = {
      declaredInputs: { value: 'value' },
      inputs: { value: ['value', 0, Number] },
    };
    coreDefineProperty(Parent, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Parent, '__prop__metadata__', {
      value: [
        {
          ngMetadataName: 'Input',
          required: true,
          transform: Number,
        },
      ],
    });
    coreDefineProperty(Parent, 'ɵdir', definition);
    coreDefineProperty(Child, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Child, 'ɵdir', {
      ...definition,
      inputs: { ...definition.inputs },
    });

    const actual = collectDeclarations(Child);

    expect(actual.inputs).toEqual([
      { name: 'value', required: true, transform: Number },
    ]);
    expect(actual.Directive.inputs).toEqual(actual.inputs);
    expect(collectDeclarations(Parent).inputs).toEqual([
      { name: 'value', required: true, transform: Number },
    ]);
  });

  it('honors required:false on the child input decorator', () => {
    class Parent {}
    class Child extends Parent {}

    const definition = {
      declaredInputs: { value: 'value' },
      inputs: { value: ['value', 0, Number] },
    };
    coreDefineProperty(Parent, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Parent, '__prop__metadata__', {
      value: [
        {
          ngMetadataName: 'Input',
          required: true,
          transform: Number,
        },
      ],
    });
    coreDefineProperty(Parent, 'ɵdir', definition);
    coreDefineProperty(Child, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Child, 'ɵdir', {
      ...definition,
      inputs: { ...definition.inputs },
    });
    coreDefineProperty(Child, '__prop__metadata__', {
      value: [
        {
          ngMetadataName: 'Input',
          required: false,
          transform: Number,
        },
      ],
    });

    const actual = collectDeclarations(Child);

    expect(actual.inputs).toEqual([
      { name: 'value', required: false, transform: Number },
    ]);
    expect(actual.Directive.inputs).toEqual(actual.inputs);
    expect(collectDeclarations(Parent).inputs).toEqual([
      { name: 'value', required: true, transform: Number },
    ]);
  });

  it('removes inherited required metadata when the child decorator uses the default', () => {
    class Parent {}
    class Child extends Parent {}

    const definition = {
      declaredInputs: { value: 'value' },
      inputs: { value: ['value', 0, Number] },
    };
    coreDefineProperty(Parent, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Parent, '__prop__metadata__', {
      value: [
        {
          ngMetadataName: 'Input',
          required: true,
          transform: Number,
        },
      ],
    });
    coreDefineProperty(Parent, 'ɵdir', definition);
    coreDefineProperty(Child, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Child, 'ɵdir', {
      ...definition,
      inputs: { ...definition.inputs },
    });
    coreDefineProperty(Child, '__prop__metadata__', {
      value: [{ ngMetadataName: 'Input', transform: Number }],
    });

    const actual = collectDeclarations(Child);

    expect(actual.inputs).toEqual([
      { name: 'value', transform: Number },
    ]);
    expect(actual.Directive.inputs).toEqual(actual.inputs);
    expect(collectDeclarations(Parent).inputs).toEqual([
      { name: 'value', required: true, transform: Number },
    ]);
  });

  it('removes inherited required metadata when the child annotation redeclares the input', () => {
    class Parent {}
    class Child extends Parent {}

    const definition = {
      declaredInputs: { value: 'value' },
      inputs: { value: ['value', 0, Number] },
    };
    coreDefineProperty(Parent, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Parent, '__prop__metadata__', {
      value: [
        {
          ngMetadataName: 'Input',
          required: true,
          transform: Number,
        },
      ],
    });
    coreDefineProperty(Parent, 'ɵdir', definition);
    coreDefineProperty(Child, 'ɵdir', {
      ...definition,
      inputs: { ...definition.inputs },
    });
    coreDefineProperty(Child, '__annotations__', [
      {
        ngMetadataName: 'Directive',
        inputs: [{ name: 'value', transform: Number }],
      },
    ]);

    const actual = collectDeclarations(Child);

    expect(actual.inputs).toEqual([
      { name: 'value', transform: Number },
    ]);
    expect(actual.Directive.inputs).toEqual(actual.inputs);
    expect(collectDeclarations(Parent).inputs).toEqual([
      { name: 'value', required: true, transform: Number },
    ]);
  });
});

import coreDefineProperty from '../common/core.define-property';
import funcGetGlobal from '../common/func.get-global';

import collectDeclarations from './collect-declarations';

// @see https://github.com/help-me-mom/ng-mocks/issues/15006
describe('collect-declarations:inherited compiled inputs', () => {
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

  it('replaces an inherited input transform with the compiled child binding', () => {
    class Parent {}
    class Child extends Parent {}
    class Sibling extends Parent {}

    const parentInput = Object.freeze({
      ngMetadataName: 'Input',
      alias: 'publicValue',
      required: true,
      transform: Number,
    });
    const childInput = Object.freeze({
      ngMetadataName: 'Input',
      alias: 'publicValue',
      transform: String,
    });
    coreDefineProperty(Parent, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Parent, '__prop__metadata__', {
      value: [
        parentInput,
        {
          ngMetadataName: 'Input',
          alias: 'otherValue',
          transform: Number,
        },
      ],
      inherited: [{ ngMetadataName: 'Input', transform: Number }],
    });
    coreDefineProperty(Child, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    // Compiled metadata replaces the transform but does not redeclare required.
    coreDefineProperty(Child, 'ɵdir', {
      declaredInputs: { publicValue: 'value' },
      inputs: { publicValue: ['value', 0, childInput.transform] },
    });

    const parent = collectDeclarations(Parent);
    const actual = collectDeclarations(Child);
    const sibling = collectDeclarations(Sibling);
    const expected = {
      name: 'value',
      alias: 'publicValue',
      required: true,
      transform: String,
    };

    expect(actual.inputs).toContain(expected);
    expect(actual.Directive.inputs).toContain(expected);
    expect(actual.inputs.length).toBe(3);
    expect(actual.inputs).toContain({
      name: 'value',
      alias: 'otherValue',
      transform: Number,
    });
    expect(actual.inputs).toContain({
      name: 'inherited',
      transform: Number,
    });
    expect(parent.inputs).toContain({
      name: 'value',
      alias: 'publicValue',
      required: true,
      transform: Number,
    });
    expect(sibling.inputs).toEqual(parent.inputs);
    expect(collectDeclarations(Parent)).toBe(parent);
    expect(collectDeclarations(Child)).toBe(actual);
    expect(parentInput).toEqual({
      ngMetadataName: 'Input',
      alias: 'publicValue',
      required: true,
      transform: Number,
    });
    expect(childInput).toEqual({
      ngMetadataName: 'Input',
      alias: 'publicValue',
      transform: String,
    });
  });

  it('removes an inherited input transform when the compiled child binding has none', () => {
    class Parent {}
    class Child extends Parent {}
    class Sibling extends Parent {}

    const parentInput = Object.freeze({
      ngMetadataName: 'Input',
      alias: 'publicValue',
      required: true,
      transform: Number,
    });
    const childInput = Object.freeze({
      ngMetadataName: 'Input',
      alias: 'publicValue',
      transform: undefined,
    });
    coreDefineProperty(Parent, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Parent, '__prop__metadata__', {
      value: [
        parentInput,
        {
          ngMetadataName: 'Input',
          alias: 'otherValue',
          transform: Number,
        },
      ],
      inherited: [{ ngMetadataName: 'Input', transform: Number }],
    });
    coreDefineProperty(Child, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Child, 'ɵdir', {
      declaredInputs: { publicValue: 'value' },
      inputs: { publicValue: ['value', 0, childInput.transform] },
    });

    const parent = collectDeclarations(Parent);
    const actual = collectDeclarations(Child);
    const sibling = collectDeclarations(Sibling);
    const expected = {
      name: 'value',
      alias: 'publicValue',
      required: true,
    };

    expect(actual.inputs).toContain(expected);
    expect(actual.Directive.inputs).toContain(expected);
    expect(actual.inputs.length).toBe(3);
    expect(actual.inputs).toContain({
      name: 'value',
      alias: 'otherValue',
      transform: Number,
    });
    expect(actual.inputs).toContain({
      name: 'inherited',
      transform: Number,
    });
    expect(parent.inputs).toContain({
      name: 'value',
      alias: 'publicValue',
      required: true,
      transform: Number,
    });
    expect(sibling.inputs).toEqual(parent.inputs);
    expect(collectDeclarations(Parent)).toBe(parent);
    expect(collectDeclarations(Child)).toBe(actual);
    expect(parentInput).toEqual({
      ngMetadataName: 'Input',
      alias: 'publicValue',
      required: true,
      transform: Number,
    });
    expect(childInput).toEqual({
      ngMetadataName: 'Input',
      alias: 'publicValue',
      transform: undefined,
    });
  });
});

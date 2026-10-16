import coreDefineProperty from '../common/core.define-property';

import collectDeclarations from './collect-declarations';

describe('collect-declarations:binding identity', () => {
  it('preserves separate input fields with the same public alias', () => {
    const inputs = ['first : shared', 'first : alternate'];
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Directive', inputs }],
      __prop__metadata__: {
        second: [
          {
            ngMetadataName: 'Input',
            alias: 'shared',
            required: true,
          },
        ],
      },
    });

    expect(actual.Directive.inputs).toEqual([
      'first : shared',
      'first : alternate',
      { name: 'second', alias: 'shared', required: true },
    ]);
    expect(inputs).toEqual(['first : shared', 'first : alternate']);
    expect(actual.Directive.inputs).not.toBe(inputs);
  });

  it('preserves separate output fields with the same public alias', () => {
    const outputs = ['first : shared', 'first : alternate'];
    const actual = collectDeclarations({
      __annotations__: [{ ngMetadataName: 'Directive', outputs }],
      __prop__metadata__: {
        second: [{ ngMetadataName: 'Output', alias: 'shared' }],
      },
    });

    expect(actual.Directive.outputs).toEqual([
      'first : shared',
      'first : alternate',
      'second:shared',
    ]);
    expect(outputs).toEqual(['first : shared', 'first : alternate']);
    expect(actual.Directive.outputs).not.toBe(outputs);
  });

  it('preserves an inherited input when a child field uses its public alias', () => {
    class Parent {}
    class Child extends Parent {}
    class Sibling extends Parent {}

    coreDefineProperty(Parent, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Parent, '__prop__metadata__', {
      first: [
        {
          ngMetadataName: 'Input',
          alias: 'shared',
          required: true,
          transform: Number,
        },
      ],
    });
    coreDefineProperty(Child, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Child, '__prop__metadata__', {
      second: [{ ngMetadataName: 'Input', alias: 'shared' }],
    });

    const parent = collectDeclarations(Parent);
    const actual = collectDeclarations(Child);

    expect(actual.inputs).toEqual([
      'second:shared',
      {
        name: 'first',
        alias: 'shared',
        required: true,
        transform: Number,
      },
    ]);
    expect(actual.Directive.inputs).toEqual(actual.inputs);
    expect(parent.inputs).toEqual([
      {
        name: 'first',
        alias: 'shared',
        required: true,
        transform: Number,
      },
    ]);
    expect(collectDeclarations(Sibling).inputs).toEqual(
      parent.inputs,
    );
  });
});

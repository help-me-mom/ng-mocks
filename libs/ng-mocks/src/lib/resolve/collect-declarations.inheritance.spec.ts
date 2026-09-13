import coreDefineProperty from '../common/core.define-property';
import funcGetGlobal from '../common/func.get-global';

import collectDeclarations from './collect-declarations';

// @see https://github.com/help-me-mom/ng-mocks/issues/15006
describe('collect-declarations:inheritance', () => {
  beforeEach(() => {
    funcGetGlobal().__ngMocksReflectComponentType = false;
  });

  afterEach(() => {
    delete funcGetGlobal().__ngMocksReflectComponentType;
  });

  for (const ngMetadataName of [
    'ContentChild',
    'ContentChildren',
    'ViewChild',
    'ViewChildren',
  ]) {
    for (const compiled of [false, true]) {
      it(`replaces the complete inherited ${ngMetadataName} with compiled:${compiled}`, () => {
        class Parent {}
        class Child extends Parent {}
        class Sibling extends Parent {}

        const parentQuery = Object.freeze({
          ngMetadataName,
          selector: 'parent',
          descendants: true,
          read: Parent,
        });
        const childQuery = Object.freeze({
          ngMetadataName,
          selector: 'child',
        });
        const inheritedQuery = Object.freeze({
          ngMetadataName,
          selector: 'inherited',
        });
        coreDefineProperty(Parent, '__annotations__', [
          { ngMetadataName: 'Directive' },
        ]);
        coreDefineProperty(Parent, '__prop__metadata__', {
          target: [parentQuery],
          inherited: [inheritedQuery],
        });
        coreDefineProperty(Child, '__annotations__', [
          { ngMetadataName: 'Directive' },
        ]);
        if (compiled) {
          coreDefineProperty(Child, 'propDecorators', {
            target: [
              {
                type: { prototype: { ngMetadataName } },
                args: ['child'],
              },
              {
                type: { prototype: { ngMetadataName } },
                args: ['ignored'],
              },
            ],
          });
        } else {
          coreDefineProperty(Child, '__prop__metadata__', {
            target: [
              childQuery,
              { ngMetadataName, selector: 'ignored' },
            ],
          });
        }

        const parent = collectDeclarations(Parent);
        const actual = collectDeclarations(Child);
        const sibling = collectDeclarations(Sibling);

        expect(actual.queries.target).toEqual({
          isViewQuery: ngMetadataName.indexOf('View') === 0,
          ngMetadataName,
          selector: 'child',
        });
        expect(actual.Directive.queries.target).toEqual(
          actual.queries.target,
        );
        expect(actual.queries.inherited).toEqual(
          parent.queries.inherited,
        );
        expect(sibling.queries).toEqual(parent.queries);
        expect(parent.queries.target.selector).toBe('parent');
        expect(parent.queries.target.read).toBe(Parent);
        expect(parent.queries.target.descendants).toBe(true);
        expect(collectDeclarations(Parent)).toBe(parent);
        expect(collectDeclarations(Child)).toBe(actual);
        expect(parentQuery).toEqual({
          ngMetadataName,
          selector: 'parent',
          descendants: true,
          read: Parent,
        });
        expect(childQuery).toEqual({
          ngMetadataName,
          selector: 'child',
        });
      });
    }
  }

  for (const transform of [String, undefined]) {
    for (const compiled of [false, true]) {
      it(`replaces inherited input metadata with transform:${transform && transform.name}, compiled:${compiled}`, () => {
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
          transform,
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
        if (compiled) {
          coreDefineProperty(Child, 'ɵdir', {
            declaredInputs: { publicValue: 'value' },
            inputs: { publicValue: ['value', 0, transform] },
          });
        } else {
          coreDefineProperty(Child, '__prop__metadata__', {
            value: [childInput],
          });
        }

        const parent = collectDeclarations(Parent);
        const actual = collectDeclarations(Child);
        const sibling = collectDeclarations(Sibling);
        const expected = compiled
          ? {
              name: 'value',
              alias: 'publicValue',
              required: true,
              ...(transform ? { transform } : {}),
            }
          : transform
            ? { name: 'value', alias: 'publicValue', transform }
            : 'value:publicValue';

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
          transform,
        });
      });
    }
  }

  it('preserves property query precedence over child annotations', () => {
    class Parent {}
    class Child extends Parent {}

    const query = Object.freeze({
      ngMetadataName: 'ContentChild',
      selector: 'child',
    });
    coreDefineProperty(Parent, '__annotations__', [
      { ngMetadataName: 'Directive' },
    ]);
    coreDefineProperty(Parent, '__prop__metadata__', {
      target: [
        {
          ngMetadataName: 'ContentChild',
          selector: 'parent',
          read: Parent,
        },
      ],
      inherited: [
        { ngMetadataName: 'ContentChild', selector: 'inherited' },
      ],
    });
    coreDefineProperty(Child, '__annotations__', [
      { ngMetadataName: 'Directive', queries: { target: query } },
    ]);

    const actual = collectDeclarations(Child);

    expect(actual.Directive.queries.target.selector).toBe('parent');
    expect(actual.Directive.queries.inherited.selector).toBe(
      'inherited',
    );
    expect(
      collectDeclarations(Parent).Directive.queries.target.selector,
    ).toBe('parent');
    expect(query).toEqual({
      ngMetadataName: 'ContentChild',
      selector: 'child',
    });
  });
});

describe('collect-declarations:inherited compiled inputs', () => {
  afterEach(() => {
    delete funcGetGlobal().__ngMocksReflectComponentType;
  });

  for (const mode of [
    'inherited',
    'compiled',
    'decorated',
    'default',
    'annotation',
  ]) {
    it(`preserves inherited required metadata with ${mode} input definitions`, () => {
      funcGetGlobal().__ngMocksReflectComponentType = false;
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
      const definition = {
        declaredInputs: { value: 'value' },
        inputs: { value: ['value', 0, Number] },
      };
      coreDefineProperty(Parent, 'ɵdir', definition);
      if (mode !== 'inherited') {
        coreDefineProperty(Child, '__annotations__', [
          { ngMetadataName: 'Directive' },
        ]);
        coreDefineProperty(Child, 'ɵdir', {
          ...definition,
          inputs: { ...definition.inputs },
        });
      }
      if (mode === 'decorated') {
        coreDefineProperty(Child, '__prop__metadata__', {
          value: [
            {
              ngMetadataName: 'Input',
              required: false,
              transform: Number,
            },
          ],
        });
      } else if (mode === 'default') {
        coreDefineProperty(Child, '__prop__metadata__', {
          value: [{ ngMetadataName: 'Input', transform: Number }],
        });
      } else if (mode === 'annotation') {
        coreDefineProperty(Child, '__annotations__', [
          {
            ngMetadataName: 'Directive',
            inputs: [{ name: 'value', transform: Number }],
          },
        ]);
      }

      const actual = collectDeclarations(Child);

      expect(actual.inputs).toEqual([
        {
          name: 'value',
          ...(mode === 'default' || mode === 'annotation'
            ? {}
            : { required: mode !== 'decorated' }),
          transform: Number,
        },
      ]);
      expect(actual.Directive.inputs).toEqual(actual.inputs);
      expect(collectDeclarations(Parent).inputs).toEqual([
        { name: 'value', required: true, transform: Number },
      ]);
    });
  }
});

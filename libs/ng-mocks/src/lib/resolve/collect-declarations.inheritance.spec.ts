import coreDefineProperty from '../common/core.define-property';
import funcGetGlobal from '../common/func.get-global';

import collectDeclarations from './collect-declarations';

// @see https://github.com/help-me-mom/ng-mocks/issues/15006
describe('collect-declarations:inherited queries', () => {
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

  for (const ngMetadataName of [
    'ContentChild',
    'ContentChildren',
    'ViewChild',
    'ViewChildren',
  ]) {
    it(`replaces the complete inherited ${ngMetadataName} with a child property decorator`, () => {
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
      coreDefineProperty(Child, '__prop__metadata__', {
        target: [childQuery, { ngMetadataName, selector: 'ignored' }],
      });

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

    it(`replaces the complete inherited ${ngMetadataName} with a compiled child decorator`, () => {
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
      coreDefineProperty(Child, 'propDecorators', {
        target: [
          {
            type: { prototype: { ngMetadataName } },
            args: [childQuery.selector],
          },
          {
            type: { prototype: { ngMetadataName } },
            args: ['ignored'],
          },
        ],
      });

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

import coreDefineProperty from '../common/core.define-property';
import { ngMocks } from '../mock-helper/mock-helper';

import extractMethods from './helper.extract-methods-from-prototype';

// @see https://github.com/help-me-mom/ng-mocks/issues/15002
describe('helper.extract-methods-from-prototype', () => {
  it('retains a child method over an ancestor accessor across intermediate prototypes', () => {
    let reads = 0;
    class Parent {
      public read(): string {
        return 'parent';
      }
      public inherited(): string {
        return 'inherited';
      }
    }
    class Middle extends Parent {}
    class Child extends Middle {
      public read(): string {
        return 'child';
      }
    }
    ngMocks.stubMember(
      Parent.prototype,
      'read',
      () => {
        reads += 1;
        return () => 'accessor';
      },
      'get',
    );
    const parent = Object.getOwnPropertyDescriptor(
      Parent.prototype,
      'read',
    );
    const child = Object.getOwnPropertyDescriptor(
      Child.prototype,
      'read',
    );
    const properties: Array<string | symbol> = [];

    expect(extractMethods(Child.prototype, properties)).toEqual([
      'read',
      'inherited',
    ]);
    expect(properties).toEqual([]);
    expect(extractMethods(Child.prototype)).toEqual([
      'read',
      'inherited',
    ]);

    const target = {};
    ngMocks.stub(target, Child.prototype);
    expect(Object.getOwnPropertyDescriptor(target, 'read')).toEqual(
      child,
    );
    expect(
      Object.getOwnPropertyDescriptor(Parent.prototype, 'read'),
    ).toEqual(parent);
    expect(
      Object.getOwnPropertyDescriptor(Child.prototype, 'read'),
    ).toEqual(child);
    expect(reads).toBe(0);
  });

  it('lets a child accessor hide an ancestor method even without collecting properties', () => {
    let reads = 0;
    let writes = 0;
    class Parent {
      public read(): string {
        return 'parent';
      }
      public inherited(): string {
        return 'inherited';
      }
    }
    class Child extends Parent {
      public read(): string {
        return 'child';
      }
    }
    ngMocks.stubMember(
      Child.prototype,
      'read',
      () => {
        reads += 1;
        return () => 'accessor';
      },
      'get',
    );
    ngMocks.stubMember(
      Child.prototype,
      'read',
      () => {
        writes += 1;
      },
      'set',
    );
    const parent = Object.getOwnPropertyDescriptor(
      Parent.prototype,
      'read',
    );
    const child = Object.getOwnPropertyDescriptor(
      Child.prototype,
      'read',
    );
    const properties: Array<string | symbol> = [];

    expect(extractMethods(Child.prototype, properties)).toEqual([
      'inherited',
    ]);
    expect(properties).toEqual(['read']);
    expect(extractMethods(Child.prototype)).toEqual(['inherited']);

    const target = {};
    ngMocks.stub(target, Child.prototype);
    expect(Object.getOwnPropertyDescriptor(target, 'read')).toEqual(
      child,
    );
    expect(
      Object.getOwnPropertyDescriptor(Parent.prototype, 'read'),
    ).toEqual(parent);
    expect(
      Object.getOwnPropertyDescriptor(Child.prototype, 'read'),
    ).toEqual(child);
    expect(reads).toBe(0);
    expect(writes).toBe(0);
  });

  it('tracks shadowed symbols by identity while retaining distinct symbols with the same description', () => {
    const key = Symbol('read');
    const other = Symbol('read');
    let reads = 0;
    class Parent {
      public [key](): string {
        return 'parent';
      }
      public get [other](): string {
        reads += 1;
        return 'other';
      }
    }
    class Child extends Parent {
      public [key](): string {
        return 'child';
      }
    }
    ngMocks.stubMember(
      Parent.prototype,
      key,
      () => {
        reads += 1;
        return () => 'accessor';
      },
      'get',
    );
    const parent = Object.getOwnPropertyDescriptor(
      Parent.prototype,
      key,
    );
    const child = Object.getOwnPropertyDescriptor(
      Child.prototype,
      key,
    );
    const sibling = Object.getOwnPropertyDescriptor(
      Parent.prototype,
      other,
    );
    const properties: Array<string | symbol> = [];

    expect(extractMethods(Child.prototype, properties)).toEqual([
      key,
    ]);
    expect(properties).toEqual([other]);
    expect(
      Object.getOwnPropertyDescriptor(Parent.prototype, key),
    ).toEqual(parent);
    expect(
      Object.getOwnPropertyDescriptor(Child.prototype, key),
    ).toEqual(child);
    expect(
      Object.getOwnPropertyDescriptor(Parent.prototype, other),
    ).toEqual(sibling);
    expect(reads).toBe(0);
  });

  it('keeps methods whose names were seeded by declaration metadata', () => {
    let reads = 0;
    class Target {
      public read(): string {
        return 'method';
      }
      public get value(): string {
        reads += 1;
        return 'value';
      }
    }
    // Declaration callers seed query and host metadata before extracting prototype members.
    const properties: Array<string | symbol> = ['read', 'value'];

    expect(extractMethods(Target.prototype, properties)).toEqual([
      'read',
    ]);
    expect(properties).toEqual(['read', 'value']);
    expect(reads).toBe(0);
  });

  it('retains ordinary data keys that shadow ancestor accessors', () => {
    let reads = 0;
    class Parent {
      public get value(): string {
        reads += 1;
        return 'parent';
      }
    }
    class Child extends Parent {}
    coreDefineProperty(Child.prototype, 'value', 'child');
    const descriptor = Object.getOwnPropertyDescriptor(
      Child.prototype,
      'value',
    );
    const properties: Array<string | symbol> = [];

    expect(extractMethods(Child.prototype, properties)).toEqual([
      'value',
    ]);
    expect(properties).toEqual([]);
    expect(
      Object.getOwnPropertyDescriptor(Child.prototype, 'value'),
    ).toEqual(descriptor);
    expect(reads).toBe(0);
  });
});

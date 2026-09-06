import {
  extendClass,
  extendClassicClass,
  extractDependency,
} from './core.helpers';
import decorateMock from './decorate.mock';
import funcGetGlobal from './func.get-global';

describe('extendClassicClass', () => {
  it('preserves custom constructor stringification and its receiver', () => {
    const calls: any[] = [];
    class Base {
      public static toString() {
        calls.push(this);
        return 'custom constructor';
      }
    }

    const Child = extendClassicClass(Base);

    expect(Child.toString()).toBe('custom constructor');
    expect(calls).toEqual([Child]);
  });

  it('constructs subclasses when Proxy is unavailable', () => {
    const glb = funcGetGlobal();
    const originalProxy = glb.Proxy;
    class Base {
      public constructor(public value: string) {}
    }

    try {
      glb.Proxy = undefined;
      const Child = extendClassicClass(Base);
      class Grandchild extends Child {}
      const instance = new Grandchild('value');

      expect(instance.value).toBe('value');
      expect(instance instanceof Grandchild).toBe(true);
      expect(instance instanceof Child).toBe(true);
      expect(instance instanceof Base).toBe(true);
      expect(instance.constructor).toBe(Grandchild);
    } finally {
      glb.Proxy = originalProxy;
    }
  });

  it('constructs subclasses when Reflect is unavailable', () => {
    const glb = funcGetGlobal();
    const originalReflect = glb.Reflect;
    class Base {
      public constructor(public value: string) {}
    }

    try {
      glb.Reflect = undefined;
      const Child = extendClassicClass(Base);
      const instance = new Child('value');

      expect(instance.value).toBe('value');
      expect(instance instanceof Child).toBe(true);
      expect(instance instanceof Base).toBe(true);
      expect(instance.constructor).toBe(Child);
    } finally {
      glb.Reflect = originalReflect;
    }
  });

  it('constructs subclasses when Reflect.construct is unavailable', () => {
    const originalConstruct = Reflect.construct;
    class Base {
      public constructor(public value: string) {}
    }

    try {
      Reflect.construct = undefined as never;
      const Child = extendClassicClass(Base);
      const instance = new Child('value');

      expect(instance.value).toBe('value');
      expect(instance instanceof Child).toBe(true);
      expect(instance instanceof Base).toBe(true);
      expect(instance.constructor).toBe(Child);
    } finally {
      Reflect.construct = originalConstruct;
    }
  });
});

describe('DebuggableMock', () => {
  it('prefixes the class name with MockOf', () => {
    class Foo {}
    const mock = extendClass(Foo);
    decorateMock(mock, Foo);

    expect(mock.name).toBe('MockOfFoo');
  });

  it('adds a mockOf property that is the class being replaced with a mock copy', () => {
    class Bar {}
    const mock = extendClass(Bar);
    decorateMock(mock, Bar);

    expect((mock as any).mockOf).toBe(Bar);
  });
});

describe('extractDependency', () => {
  it('skips extraction when no destination set is passed', () => {
    expect(() =>
      extractDependency([
        'token',
        [{ ngMetadataName: 'Optional' }, 'optional'],
      ]),
    ).not.toThrow();
  });

  it('collects dependencies and skips injection flags', () => {
    const actual = new Set<any>();
    const values: any[] = [];

    extractDependency(
      [
        'token',
        [{ ngMetadataName: 'Optional' }, 'optional'],
        [{ ngMetadataName: 'Self' }, 'self'],
        ['nested'],
      ],
      actual,
    );
    for (const value of actual) values.push(value);

    expect(values).toEqual(['token', 'optional', 'self', 'nested']);
  });
});

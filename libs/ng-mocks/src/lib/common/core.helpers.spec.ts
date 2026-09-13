import coreDefineProperty from './core.define-property';
import {
  extendClass,
  extendClassicClass,
  extractDependency,
  flatten,
} from './core.helpers';
import decorateMock from './decorate.mock';
import funcGetGlobal from './func.get-global';

describe('flatten', () => {
  it('preserves nested wrapper order and provider identity without changing source containers', () => {
    const factory = jasmine.createSpy('factory');
    const first = {
      provide: 'multi',
      multi: true,
      useValue: 'first',
    };
    const second = {
      provide: 'multi',
      multi: true,
      useFactory: factory,
    };
    const empty = Object.freeze({ ɵproviders: Object.freeze([]) });
    const nested = Object.freeze([empty, second]);
    const innerProviders = Object.freeze([first, nested]);
    const inner = Object.freeze({ ɵproviders: innerProviders });
    const outerProviders = Object.freeze([inner]);
    const outer = Object.freeze({ ɵproviders: outerProviders });
    const value = Object.freeze({
      ɵproviders: Object.freeze([first]),
    });
    const tail = { provide: 'data', useValue: value };
    const repeated = Object.freeze([tail, outer]);
    const source = Object.freeze([outer, repeated]);
    const prefix = { provide: 'prefix', useValue: 'prefix' };
    const destination = [prefix];

    const actual = flatten<unknown>(source, destination);
    const expected = [prefix, first, second, tail, first, second];

    expect(actual).toBe(destination);
    expect(actual).toEqual(expected);
    for (let index = 0; index < expected.length; index += 1) {
      expect(actual[index]).toBe(expected[index]);
    }
    expect(factory).not.toHaveBeenCalled();
    expect(tail.useValue).toBe(value);
    expect(source).toEqual([outer, [tail, outer]]);
    expect(source[1]).toBe(repeated);
    expect(outer.ɵproviders).toBe(outerProviders);
    expect(outerProviders).toEqual([inner]);
    expect(inner.ɵproviders).toBe(innerProviders);
    expect(innerProviders).toEqual([first, [empty, second]]);
    expect(innerProviders[1]).toBe(nested);
    expect(empty.ɵproviders).toEqual([]);
  });

  it('preserves falsy leaves, callable tokens and objects with non-array provider fields', () => {
    const callable = jasmine.createSpy('callable');
    const ordinary = Object.freeze({ ɵproviders: callable });
    const source = [
      null,
      undefined,
      false,
      0,
      '',
      ordinary,
      callable,
    ];
    Object.freeze(source);

    const actual = flatten<unknown>(source);

    expect(actual).not.toBe(source);
    expect(actual).toEqual(source);
    expect(actual[5]).toBe(ordinary);
    expect(actual[6]).toBe(callable);
    expect(ordinary.ɵproviders).toBe(callable);
    expect(callable).not.toHaveBeenCalled();
  });
});

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

// @see https://github.com/help-me-mom/ng-mocks/issues/14914
describe('extendClass', () => {
  const ivyFields = ['ɵcmp', 'ɵdir', 'ɵfac', 'ɵinj', 'ɵmod', 'ɵpipe'];

  it('isolates inherited Ivy definitions from sibling and grandchild definitions', () => {
    class Base {}

    const originals = new Map<string, PropertyDescriptor>();
    for (const field of ivyFields) {
      Object.defineProperty(Base, field, {
        value: {
          field,
          inputs: {},
          outputs: {},
          selectors: [['base']],
        },
      });
      originals.set(
        field,
        Object.getOwnPropertyDescriptor(Base, field)!,
      );
    }

    const First: any = extendClass(Base);
    const Second: any = extendClass(Base);
    expect(First).not.toBe(Second);

    const firstDefinitions = new Map();
    const secondDefinitions = new Map();
    for (const field of ivyFields) {
      expect(First[field]).toBeUndefined();
      expect(Second[field]).toBeUndefined();
      const first = {
        field,
        inputs: {},
        outputs: {},
        selectors: [['first']],
      };
      const second = {
        field,
        inputs: {},
        outputs: {},
        selectors: [['second']],
      };
      firstDefinitions.set(field, first);
      secondDefinitions.set(field, second);
      First[field] = first;
      coreDefineProperty(Second, field, second);
    }

    const Grandchild: any = extendClass(First);
    for (const field of ivyFields) {
      expect(Grandchild[field]).toBeUndefined();
      const definition = {
        field,
        inputs: {},
        outputs: {},
        selectors: [['grandchild']],
      };
      coreDefineProperty(Grandchild, field, definition);

      expect(Grandchild[field]).toBe(definition);
      expect(First[field]).toBe(firstDefinitions.get(field));
      expect(Second[field]).toBe(secondDefinitions.get(field));
      expect((Base as any)[field]).toBe(originals.get(field)!.value);
      expect(Object.getOwnPropertyDescriptor(Base, field)).toEqual(
        originals.get(field),
      );
    }
    expect(new Grandchild() instanceof First).toBe(true);
    expect(new Grandchild() instanceof Base).toBe(true);
  });

  it('shadows inherited Ivy getters without changing their descriptors or invoking them on child reads', () => {
    class Base {}

    const getters = new Map<string, jasmine.Spy>();
    const definitions = new Map<string, object>();
    for (const field of ivyFields) {
      const definition = {
        field,
        inputs: {},
        outputs: {},
        selectors: [['base']],
      };
      const getter = jasmine
        .createSpy(field)
        .and.returnValue(definition);
      getters.set(field, getter);
      definitions.set(field, definition);
      Object.defineProperty(Base, field, { get: getter });
    }

    const Child: any = extendClass(Base);

    for (const field of ivyFields) {
      const getter = getters.get(field)!;
      // Parameter reflection may read the base; child reads must not trigger its getters.
      const calls = getter.calls.count();
      expect(Child[field]).toBeUndefined();
      expect(Child[field]).toBeUndefined();
      expect(getter.calls.count()).toBe(calls);
      expect(Object.getOwnPropertyDescriptor(Base, field)).toEqual({
        configurable: false,
        enumerable: false,
        get: getter,
        set: undefined,
      });

      expect((Base as any)[field]).toBe(definitions.get(field));
      expect(getter.calls.count()).toBe(calls + 1);
      expect(getter.calls.mostRecent().object).toBe(Base);
    }
  });

  it('leaves absent Ivy fields absent while preserving ordinary static metadata', () => {
    class Base {
      public static metadata = { name: 'ordinary metadata' };
    }

    const Child: any = extendClass(Base);

    for (const field of ivyFields) {
      expect(field in Child).toBe(false);
      expect(
        Object.getOwnPropertyDescriptor(Child, field),
      ).toBeUndefined();
      expect(
        Object.getOwnPropertyDescriptor(Base, field),
      ).toBeUndefined();
    }
    expect(Child.metadata).toBe(Base.metadata);
    expect(
      Object.getOwnPropertyDescriptor(Child, 'metadata'),
    ).toBeUndefined();
    expect(Base.metadata).toEqual({ name: 'ordinary metadata' });
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

import { extendClass, extractDependency } from './core.helpers';
import decorateMock from './decorate.mock';

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

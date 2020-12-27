import { extendClass } from './core.helpers';
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

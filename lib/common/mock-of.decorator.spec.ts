import { MockOf } from './mock-of.decorator';

describe('DebuggableMock', () => {
  it('prefixes the class name with MockOf', () => {
    class Foo {}
    @MockOf(Foo)
    class Mock {}

    expect(Mock.name).toBe('MockOfFoo');
  });

  it('adds a mockOf property that is the class being mocked', () => {
    class Bar {}
    @MockOf(Bar)
    class Mock {}

    expect((Mock as any).mockOf).toBe(Bar);
  });
});

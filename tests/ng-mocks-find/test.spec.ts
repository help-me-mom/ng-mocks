import { MockRender, ngMocks } from 'ng-mocks';

describe('ng-mocks-find', () => {
  it('find attributes', () => {
    const fixture = MockRender(
      '<div data-1="1" data-2="test" data-3></div>',
    );

    const el1 = ngMocks.find(['data-1', 1]);
    const el2 = ngMocks.find(fixture, ['data-2', 'test']);
    const el3 = ngMocks.find(fixture.debugElement, ['data-3']);

    expect(el1).toBeDefined();
    expect(el1).toEqual(el2);
    expect(el1).toEqual(el3);
  });

  it('returns debugElement', () => {
    const fixture = MockRender(
      '<div data-1="1" data-2="test" data-3></div>',
    );
    const el = ngMocks.find(fixture, 'div');
    expect(ngMocks.find(el as any)).toEqual(el);
  });

  it('throws on unknown selectors', () => {
    const fixture = MockRender(
      '<div data-1="1" data-2="test" data-3></div>',
    );

    expect(() => ngMocks.find(fixture, {} as any)).toThrowError(
      'Cannot find an element via ngMocks.find(<UNKNOWN>)',
    );
  });
});

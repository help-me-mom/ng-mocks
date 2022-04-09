import { MockRender, ngMocks } from 'ng-mocks';

describe('ng-mocks-find-all', () => {
  it('find attributes', () => {
    const fixture = MockRender(
      '<div data-1="1" data-2="test" data-3></div>',
    );

    const [el1] = ngMocks.findAll(['data-1', 1]);
    const [el2] = ngMocks.findAll(fixture, ['data-2', 'test']);
    const [el3] = ngMocks.findAll(fixture.debugElement, ['data-3']);

    expect(el1).toBeDefined();
    expect(el1).toEqual(el2);
    expect(el1).toEqual(el3);
  });
});

import { MockRender } from 'ng-mocks';

// we need to ensure that MockRender component provides correct access to the __ngContext__ property.
describe('issue-3811', () => {
  it('provides access to __ngContext__', () => {
    const fixture = MockRender('');
    const ngContext = (fixture.componentInstance as any)
      .__ngContext__;
    expect(ngContext).toBeDefined();
  });
});

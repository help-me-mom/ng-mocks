import { Component, VERSION } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component(
  {
    standalone: true,
    template: ``,
  } as never /* TODO: remove after upgrade to a14 */,
)
class MyComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/3636
// The problem was that a standalone component caused MockRender
// to create the middleware component as standalone too.
// The fix ensures that the middleware component is always a normal declaration.
describe('issue-3636', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs a14', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(MyComponent));

  it('detects the standalone component correctly in MockRender', () => {
    const fixture = MockRender(MyComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});

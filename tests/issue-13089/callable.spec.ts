import { Component, Input } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-13089-callable',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class TargetComponent {
  @Input('callableAlias')
  public callable: (() => string) | undefined;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/13089
describe('issue-13089:callable', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('passes callable inputs by identity', () => {
    const callable = () => 'value';

    const fixture = MockRender(TargetComponent, {
      callableAlias: callable,
    });

    expect(fixture.componentInstance.callableAlias).toBe(callable);
    expect(fixture.point.componentInstance.callable).toBe(callable);
  });
});

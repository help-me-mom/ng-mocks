import { Component, Optional } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// Like ActivatedRoute, it's not decorated too.
class UndecoratedService {}

@Component({
  selector: 'target-2845',
  template: `{{ service ? 'provided' : 'missing' }}`,
})
class TargetComponent {
  constructor(
    @Optional() public readonly service: UndecoratedService,
  ) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/2845
// MockBuilder should add undecorated classes, such as ActivatedRoute, to providers.
describe('issue-2845', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent).mock(UndecoratedService),
  );

  it('provides UndecoratedService', () => {
    const fixture = MockRender(TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual('provided');
  });
});

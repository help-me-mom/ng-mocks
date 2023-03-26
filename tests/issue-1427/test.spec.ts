import { Component, HostBinding, HostListener } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-1427',
  template: '{{ id }}',
})
class TargetComponent {
  @HostBinding() public id = 'custom-form';
  @HostListener('click') public click = () => undefined;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/1427
describe('issue-1427', () => {
  beforeEach(() => MockBuilder(null, TargetComponent));

  it('ignores host bindings in mock declarations', () => {
    const fixture = MockRender(TargetComponent);

    // HostBinding with id doesn't cause a side effect.
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<target-1427></target-1427>',
    );

    // HostListener doesn't cause a side effect.
    expect(
      fixture.point.componentInstance.click,
    ).not.toHaveBeenCalled();
    ngMocks.trigger(fixture.point, 'click');
    expect(
      fixture.point.componentInstance.click,
    ).not.toHaveBeenCalled();
  });
});

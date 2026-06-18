import { Component, Input, VERSION } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-14157',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ items.length }}',
})
class TargetComponent {
  @Input() public items: string[] = [];
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14157
// Angular 22 treats OnPush as the default when `changeDetection` is not set.
// MockRender should not force the rendered point to run change detection as if
// it were CheckAlways in that case.
describe('issue-14157', () => {
  if (Number.parseInt(VERSION.major, 10) < 22) {
    it('needs a22+', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(TargetComponent));

  it('respects the default OnPush change detection', () => {
    const parameters: { items: string[] } = {
      items: [],
    };
    const fixture = MockRender(TargetComponent, parameters);

    fixture.componentInstance.items.push('demo');
    fixture.detectChanges();

    expect(fixture.point.nativeElement.innerHTML).toEqual('0');
  });

  it('updates when the input reference changes', () => {
    const parameters: { items: string[] } = {
      items: [],
    };
    const fixture = MockRender(TargetComponent, parameters);

    fixture.componentInstance.items = ['demo'];
    fixture.detectChanges();

    expect(fixture.point.nativeElement.innerHTML).toEqual('1');
  });
});

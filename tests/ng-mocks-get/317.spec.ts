import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-get-317',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template: '<a (click)="update.emit()" data-role="link"></a>',
})
class TargetComponent {
  @Output() public readonly update = new EventEmitter<void>();
}

describe('ng-mocks-find-get:317', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('finds by css selector', () => {
    MockRender(TargetComponent);
    expect(ngMocks.get('a', ElementRef)).toBeDefined();
    expect(
      ngMocks.get('span', ElementRef, undefined),
    ).toBeUndefined();
  });

  it('finds by attribute selector', () => {
    MockRender(TargetComponent);
    expect(
      ngMocks.get(['data-role', 'link'], ElementRef),
    ).toBeDefined();
    expect(
      ngMocks.get(['data-role', 'link1'], ElementRef, undefined),
    ).toBeUndefined();
  });
});

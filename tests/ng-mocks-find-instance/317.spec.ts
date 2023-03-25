import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-find-instance-317',
  template: '<a (click)="update.emit()" data-role="link"></a>',
})
class TargetComponent {
  @Output() public readonly update = new EventEmitter<void>();
}

describe('ng-mocks-find-instance:317', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('finds by css selector', () => {
    MockRender(TargetComponent);
    expect(ngMocks.findInstance('a', ElementRef)).toBeDefined();
    expect(
      ngMocks.findInstance('span', ElementRef, undefined),
    ).toBeUndefined();
  });

  it('finds by attribute selector', () => {
    MockRender(TargetComponent);
    expect(
      ngMocks.findInstance(['data-role', 'link'], ElementRef),
    ).toBeDefined();
    expect(
      ngMocks.findInstance(
        ['data-role', 'link1'],
        ElementRef,
        undefined,
      ),
    ).toBeUndefined();
  });
});

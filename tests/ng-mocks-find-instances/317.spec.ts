import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-find-instances-317',
  template: '<a (click)="update.emit()" data-role="link"></a>',
})
class TargetComponent {
  @Output() public readonly update = new EventEmitter<void>();
}

describe('ng-mocks-find-instances:317', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('finds by css selector', () => {
    MockRender(TargetComponent);
    expect(ngMocks.findInstances('a', ElementRef).length).toEqual(1);
    expect(ngMocks.findInstances('span', ElementRef).length).toEqual(
      0,
    );
  });

  it('finds by attribute selector', () => {
    MockRender(TargetComponent);
    expect(
      ngMocks.findInstances(['data-role', 'link'], ElementRef).length,
    ).toEqual(1);
    expect(
      ngMocks.findInstances(['data-role', 'link1'], ElementRef)
        .length,
    ).toEqual(0);
  });
});

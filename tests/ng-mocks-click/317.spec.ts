import { Component, EventEmitter, Output } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-click-317',
  template: '<a (click)="update.emit()" data-role="link"></a>',
})
class TargetComponent {
  @Output() public readonly update = new EventEmitter<void>();
}

describe('ng-mocks-click:317', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('finds by css selector', () => {
    const update =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    MockRender(TargetComponent, { update });
    expect(update).not.toHaveBeenCalled();
    ngMocks.click('a');
    expect(update).toHaveBeenCalled();
  });

  it('finds by attribute selector', () => {
    const update =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    MockRender(TargetComponent, { update });
    expect(update).not.toHaveBeenCalled();
    ngMocks.click(['data-role', 'link']);
    expect(update).toHaveBeenCalled();
  });
});

import { Component, EventEmitter, Output } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-trigger-317',
  template: '<input (focus)="trigger.emit()" data-label="input">',
})
class TargetComponent {
  @Output() public readonly trigger = new EventEmitter<void>();
}

describe('ng-mocks-trigger:317', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('finds by css selector', () => {
    const trigger =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    MockRender(TargetComponent, { trigger });
    expect(trigger).not.toHaveBeenCalled();
    ngMocks.trigger('input', 'focus');
    expect(trigger).toHaveBeenCalledTimes(1);
    ngMocks.trigger(['data-label'], 'focus');
    expect(trigger).toHaveBeenCalledTimes(2);
    ngMocks.trigger(['data-label', 'input'], 'focus');
    expect(trigger).toHaveBeenCalledTimes(3);
  });
});

import { Component, EventEmitter, Output } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target',
  template: '<input (focus)="focus.emit()" data-label="input">',
})
class TargetComponent {
  @Output() public readonly focus = new EventEmitter<void>();
}

describe('ng-mocks-trigger:317', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('finds by css selector', () => {
    const spy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    MockRender(TargetComponent, { focus: spy });
    expect(spy).not.toHaveBeenCalled();
    ngMocks.trigger('input', 'focus');
    expect(spy).toHaveBeenCalledTimes(1);
    ngMocks.trigger(['data-label'], 'focus');
    expect(spy).toHaveBeenCalledTimes(2);
    ngMocks.trigger(['data-label', 'input'], 'focus');
    expect(spy).toHaveBeenCalledTimes(3);
  });
});

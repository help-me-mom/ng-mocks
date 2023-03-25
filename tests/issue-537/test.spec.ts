import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'target-537',
  template: '{{ value }}',
})
class TargetComponent {
  @Output() public readonly update = new EventEmitter<void>();
  public value = 0;

  public triggerUpdate(): void {
    this.value += 1;
    this.update.emit();
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/537
describe('issue-537', () => {
  ngMocks.faster();
  beforeAll(() => MockBuilder(TargetComponent));

  it('renders default value w/o subscribers', () => {
    const fixture = MockRender(TargetComponent);
    expect(ngMocks.formatText(fixture)).toEqual('0');
    fixture.point.componentInstance.triggerUpdate();
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('0');
  });

  it('renders changed value w/ subscribers', () => {
    const fixture = MockRender(TargetComponent, {
      update: undefined,
    });
    expect(ngMocks.formatText(fixture)).toEqual('0');
    fixture.point.componentInstance.triggerUpdate();
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('1');
  });
});

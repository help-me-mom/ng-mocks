import { Component, input } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'issue-14768-target',
  standalone: true,
  template: '<span>{{ value() }}</span>',
})
class TargetComponent {
  public readonly value = input('default');
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14768
// The signal-input ViewChild becomes an enumerable wrapper property,
// so the ng-snapshot serializer exposes internal state on <mock-render>.
describe('issue-14768', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('omits internal bookkeeping from fixture snapshots', () => {
    const fixture = MockRender(TargetComponent, { value: 'test' });

    expect(fixture.point.componentInstance.value()).toBe('test');
    expect(fixture.nativeElement.textContent).toBe('test');
    expect(fixture).toMatchSnapshot();
  });
});

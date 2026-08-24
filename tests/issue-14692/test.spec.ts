import { Component, input, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-14692',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ myInput() }}',
})
class TargetComponent {
  public readonly myInput = input<string | null>(null);
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14692
describe('issue-14692', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('updates a signal input through the generated wrapper', () => {
    const fixture = MockRender(TargetComponent);

    // `readonly` protects the signal reference on TargetComponent. The
    // generated wrapper owns a separate, writable binding value.
    fixture.componentInstance.myInput = 'myValue';
    fixture.detectChanges();

    expect(fixture.point.componentInstance.myInput()).toEqual(
      'myValue',
    );
    expect(fixture.nativeElement.textContent).toContain('myValue');
  });
});

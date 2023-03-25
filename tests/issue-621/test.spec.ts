import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-621',
  template: `<button (click)="update.emit(value)">
    {{ value }}
  </button>`,
})
class TargetComponent {
  @Output() public readonly update = new EventEmitter<
    number | null | undefined
  >();
  @Input() public readonly value: number | null | undefined = null;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/621
describe('issue-621', () => {
  ngMocks.faster();

  beforeAll(() => MockBuilder(TargetComponent));

  let factory: MockRenderFactory<TargetComponent, 'update' | 'value'>;
  beforeAll(
    () =>
      (factory = MockRenderFactory(TargetComponent, [
        'update',
        'value',
      ])),
  );

  it('does not proxy update inout', () => {
    const fixture = factory();
    expect(fixture.componentInstance.value).toEqual(undefined);
    expect(fixture.point.componentInstance.value).toEqual(undefined);

    fixture.componentInstance.value = 1;
    expect(fixture.componentInstance.value).toEqual(1);
    expect(fixture.point.componentInstance.value).toEqual(undefined);
  });

  it('does not proxy update inout', () => {
    const fixture = factory();
    expect(fixture.componentInstance.update).toEqual(undefined);

    fixture.componentInstance.value = 5;
    // sets the value to point
    fixture.detectChanges();

    // checking that the emitted value comes
    // back to the middleware component
    ngMocks.click('button');
    expect(fixture.componentInstance.update).toEqual(5);
  });
});

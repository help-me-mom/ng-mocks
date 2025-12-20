import { Component, NgModule } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-touch-317',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template:
    '<input type="text" [formControl]="control" data-label="input">',
})
class TargetComponent {
  public readonly control = new FormControl();
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('ng-mocks-touch:317', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(
      ReactiveFormsModule,
    ),
  );

  it('finds by css selector', () => {
    const control =
      MockRender(TargetComponent).point.componentInstance.control;
    expect(control.touched).toEqual(false);
    ngMocks.touch('input');
    expect(control.touched).toEqual(true);

    control.markAsUntouched();
    expect(control.touched).toEqual(false);
    ngMocks.touch(['data-label']);
    expect(control.touched).toEqual(true);

    control.markAsUntouched();
    expect(control.touched).toEqual(false);
    ngMocks.touch(['data-label', 'input']);
    expect(control.touched).toEqual(true);
    control.markAsUntouched();
    expect(control.touched).toEqual(false);
    try {
      ngMocks.touch(['data-label', 'input1']);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'Cannot find an element via ngMocks.touch(data-label)',
      );
    }
    expect(control.touched).toEqual(false);
  });
});

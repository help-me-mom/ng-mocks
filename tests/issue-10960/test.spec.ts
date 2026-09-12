import { Component, forwardRef, VERSION } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  isMockOf,
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

// The reported standalone CVA imports forms and provides itself as the accessor.
@Component({
  selector: 'standalone-cva',
  template: '<input [formControl]="control" />',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandaloneCVAComponent),
      multi: true,
    },
  ],
})
class StandaloneCVAComponent implements ControlValueAccessor {
  public readonly control: FormControl = new FormControl();

  public registerOnChange(fn: (value: string | null) => void): void {
    this.control.valueChanges.subscribe(fn);
  }

  public registerOnTouched(): void {}

  public setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  public writeValue(value: string | null): void {
    this.control.setValue(value, { emitEvent: false });
  }
}

@Component({
  selector: 'target',
  template:
    '<ng-container [formGroup]="form"><standalone-cva formControlName="nestedForm"></standalone-cva></ng-container>',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    ReactiveFormsModule,
    StandaloneCVAComponent,
  ],
})
class TargetComponent {
  public readonly form = new FormGroup({
    nestedForm: new FormControl('http://example.com'),
  });
}

// @see https://github.com/help-me-mom/ng-mocks/issues/10960
describe('issue-10960', () => {
  // Standalone components are only supported by the repo matrix from Angular 14.
  // Older targets still compile this file, so we keep the compatibility guard in
  // the repo's usual style and turn the suite into a no-op there.
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs >=a14', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  MockInstance.scope();

  beforeEach(() =>
    // The host stays real while its standalone accessor dependency is mocked.
    MockBuilder(TargetComponent).keep(ReactiveFormsModule),
  );

  it('connects the mocked standalone value accessor to the host form', () => {
    const writeValue =
      typeof jest === 'undefined'
        ? jasmine.createSpy('writeValue')
        : jest.fn();

    // Capture host writes to the mock, whose original inner input is not rendered.
    MockInstance(StandaloneCVAComponent, 'writeValue', writeValue);

    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const accessor = ngMocks.find(StandaloneCVAComponent);

    expect(
      isMockOf(accessor.componentInstance, StandaloneCVAComponent),
    ).toBe(true);

    // Host -> accessor on first render: Angular should push the initial form
    // value into the CVA through writeValue.
    expect(writeValue).toHaveBeenCalledWith('http://example.com');

    // Simulate a change through the mocked accessor's registered callback.
    ngMocks.change(accessor, 'foo');
    expect(component.form.controls['nestedForm'].value).toBe('foo');

    // Host -> accessor again: later form updates should continue to call the
    // accessor instead of crashing or silently disconnecting.
    component.form.controls['nestedForm'].setValue('bar');
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});

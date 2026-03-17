import { Component, forwardRef, VERSION } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

import { createMock } from '../mock-helpers';

// This standalone CVA is the minimal reproduction of the reported issue:
// - it imports ReactiveFormsModule by itself
// - it provides NG_VALUE_ACCESSOR via useExisting + forwardRef to itself
//
// Before the fix, MockBuilder kept this declaration in skipMock mode, but the
// provider override logic still rewrote the useExisting target. That broke
// Angular's value-accessor lookup and rendering the host form crashed with:
// "Cannot read properties of undefined (reading 'constructor')".
//
// After the fix, a kept standalone declaration keeps its own useExisting
// provider, so Angular receives the real accessor and forms work normally.
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

// The host renders the standalone CVA through formControlName.
// This is the path that failed before the fix: ng-mocks kept the real
// standalone component, but its aliased NG_VALUE_ACCESSOR provider got
// rewritten as if the declaration had been mocked.
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
    // We intentionally keep the host and the standalone accessor real.
    // That forces ng-mocks through the skipMock path that used to rewrite the
    // self-referencing useExisting provider incorrectly.
    MockBuilder(TargetComponent).keep(ReactiveFormsModule),
  );

  it('keeps the standalone value accessor intact', () => {
    const writeValue = createMock('writeValue');

    // We spy on writeValue instead of asserting DOM details so that the test
    // stays focused on the value-accessor handshake:
    // - the parent form should initialize the accessor with the form value
    // - later parent-driven updates should still reach the accessor
    MockInstance(StandaloneCVAComponent, 'writeValue', writeValue);

    // Before the fix, this render threw while Angular was selecting the value
    // accessor because NG_VALUE_ACCESSOR.useExisting no longer pointed at the
    // kept standalone component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const accessor = ngMocks.find(StandaloneCVAComponent);

    // Host -> accessor on first render: Angular should push the initial form
    // value into the CVA through writeValue.
    expect(writeValue).toHaveBeenCalledWith('http://example.com');

    // Accessor -> host: changing the real input should still update the host
    // form control, proving the accessor was wired up successfully.
    ngMocks.change(accessor, 'foo');
    expect(component.form.controls['nestedForm'].value).toBe('foo');

    // Host -> accessor again: later form updates should continue to call the
    // accessor instead of crashing or silently disconnecting.
    component.form.controls['nestedForm'].setValue('bar');
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});

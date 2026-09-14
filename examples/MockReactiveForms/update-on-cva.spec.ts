import { Component, forwardRef, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
    },
  ],
  selector: 'cva-mock-reactive-forms-update-on',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'dependency',
})
class CvaComponent implements ControlValueAccessor {
  public registerOnChange(): void {}
  public registerOnTouched(): void {}
  public writeValue(): void {}
}

@Component({
  selector: 'target-mock-reactive-forms-update-on-blur',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '<cva-mock-reactive-forms-update-on [formControl]="inputValue"></cva-mock-reactive-forms-update-on>',
})
class BlurComponent {
  public readonly inputValue = new FormControl('initial', {
    updateOn: 'blur',
  });
}

@Component({
  selector: 'target-mock-reactive-forms-update-on-submit',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <form [formGroup]="form">
      <cva-mock-reactive-forms-update-on
        formControlName="inputValue"
      ></cva-mock-reactive-forms-update-on>
    </form>
  `,
})
class SubmitComponent {
  public readonly form = new FormGroup({
    inputValue: new FormControl('initial', {
      updateOn: 'submit',
    }),
  });
}

@NgModule({
  imports: [ReactiveFormsModule],
  declarations: [BlurComponent, SubmitComponent, CvaComponent],
})
class ItsModule {}

describe('MockReactiveForms:update-on-cva', () => {
  describe('blur', () => {
    beforeEach(() =>
      MockBuilder(BlurComponent, ItsModule)
        // Keep Angular's update policy while mocking the child control.
        .keep(ReactiveFormsModule),
    );

    it('commits the pending change when the mock is touched', () => {
      // Render the parent.
      const fixture = MockRender(BlurComponent);
      const component = fixture.point.componentInstance;

      // Find the mocked child.
      const mockControlEl = ngMocks.find(CvaComponent);

      // Read the initial value and state.
      expect(component.inputValue.value).toBe('initial');
      expect(component.inputValue.touched).toBe(false);
      expect(component.inputValue.pristine).toBe(true);

      // Changing the mock does not invoke its touch callback.
      ngMocks.change(CvaComponent, 'updated');
      // or ngMocks.change(mockControlEl, 'updated');

      expect(component.inputValue.value).toBe('initial');
      expect(component.inputValue.touched).toBe(false);
      expect(component.inputValue.pristine).toBe(true);

      // Touch the mock to commit a control that updates on blur.
      ngMocks.touch(mockControlEl);

      // Assert the committed value and state.
      expect(component.inputValue.value).toBe('updated');
      expect(component.inputValue.touched).toBe(true);
      expect(component.inputValue.dirty).toBe(true);
    });
  });

  describe('submit', () => {
    beforeEach(() =>
      MockBuilder(SubmitComponent, ItsModule)
        // Keep Angular's update policy while mocking the child control.
        .keep(ReactiveFormsModule),
    );

    it('keeps the change and touch pending until native submission', () => {
      // Render the parent.
      const fixture = MockRender(SubmitComponent);
      const component = fixture.point.componentInstance;

      // Find the mocked child and its real Angular form.
      const mockControlEl = ngMocks.find(CvaComponent);
      const control = component.form.controls.inputValue;
      const form = ngMocks.findInstance(FormGroupDirective);

      // Read the initial value and state.
      expect(component.form.value).toEqual({ inputValue: 'initial' });
      expect(control.touched).toBe(false);
      expect(control.pristine).toBe(true);
      expect(form.submitted).toBe(false);

      // Changing the mock leaves its value pending and untouched.
      ngMocks.change(CvaComponent, 'updated');
      // or ngMocks.change(mockControlEl, 'updated');

      expect(component.form.value).toEqual({ inputValue: 'initial' });
      expect(control.touched).toBe(false);
      expect(control.pristine).toBe(true);

      // Touching the mock also waits for the submit policy.
      ngMocks.touch(mockControlEl);

      expect(component.form.value).toEqual({ inputValue: 'initial' });
      expect(control.touched).toBe(false);
      expect(control.pristine).toBe(true);
      expect(form.submitted).toBe(false);

      // Submit the form through Angular's native event listener.
      const event = ngMocks.event('submit');
      ngMocks.trigger('form', event);

      // Assert the committed value and state.
      expect(component.form.value).toEqual({ inputValue: 'updated' });
      expect(control.touched).toBe(true);
      expect(control.dirty).toBe(true);
      expect(form.submitted).toBe(true);
      expect(event.defaultPrevented).toBe(true);
    });
  });
});

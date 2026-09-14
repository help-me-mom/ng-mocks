import { Component, forwardRef, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgForm,
  NgModel,
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
  selector: 'cva-mock-forms-update-on',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'dependency',
})
class CvaComponent implements ControlValueAccessor {
  public registerOnChange(): void {}
  public registerOnTouched(): void {}
  public writeValue(): void {}
}

@Component({
  selector: 'target-mock-forms-update-on-blur',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <cva-mock-forms-update-on
      name="inputName"
      [(ngModel)]="inputValue"
      [ngModelOptions]="{ updateOn: 'blur' }"
    ></cva-mock-forms-update-on>
  `,
})
class BlurComponent {
  public inputValue = 'initial';
}

@Component({
  selector: 'target-mock-forms-update-on-submit',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <form>
      <cva-mock-forms-update-on
        name="inputName"
        [(ngModel)]="inputValue"
        [ngModelOptions]="{ updateOn: 'submit' }"
      ></cva-mock-forms-update-on>
    </form>
  `,
})
class SubmitComponent {
  public inputValue = 'initial';
}

@NgModule({
  imports: [FormsModule],
  declarations: [BlurComponent, SubmitComponent, CvaComponent],
})
class ItsModule {}

describe('MockForms:update-on-cva', () => {
  describe('blur', () => {
    // Mock the child while keeping real ngModel timing and CVA registration.
    beforeEach(() =>
      MockBuilder(BlurComponent, ItsModule).keep(FormsModule),
    );

    it('commits the pending change when the mock is touched', async () => {
      // Render the parent and wait for ngModel registration.
      const fixture = MockRender(BlurComponent);
      await fixture.whenStable();
      const component = fixture.point.componentInstance;

      // Find the mocked child and its real Angular control.
      const mockControlEl = ngMocks.find(CvaComponent);
      const control = ngMocks.get(mockControlEl, NgModel).control;

      // Read the initial value and state.
      expect(component.inputValue).toBe('initial');
      expect(control.value).toBe('initial');
      expect(control.touched).toBe(false);
      expect(control.pristine).toBe(true);

      // Changing the mock does not invoke its touch callback.
      ngMocks.change(CvaComponent, 'updated');
      // or ngMocks.change(mockControlEl, 'updated');

      expect(component.inputValue).toBe('initial');
      expect(control.value).toBe('initial');
      expect(control.touched).toBe(false);
      expect(control.pristine).toBe(true);

      // Touch the mock to commit a control that updates on blur.
      ngMocks.touch(mockControlEl);

      // Assert the committed value and state.
      expect(component.inputValue).toBe('updated');
      expect(control.value).toBe('updated');
      expect(control.touched).toBe(true);
      expect(control.dirty).toBe(true);
    });
  });

  describe('submit', () => {
    // Keep the real form so submission can commit the mocked child's pending value.
    beforeEach(() =>
      MockBuilder(SubmitComponent, ItsModule).keep(FormsModule),
    );

    it('keeps the change and touch pending until native submission', async () => {
      // Render the parent and wait for ngModel registration.
      const fixture = MockRender(SubmitComponent);
      await fixture.whenStable();
      const component = fixture.point.componentInstance;

      // Find the mocked child and its real Angular form.
      const mockControlEl = ngMocks.find(CvaComponent);
      const control = ngMocks.get(mockControlEl, NgModel).control;
      const form = ngMocks.findInstance(NgForm);

      // Read the initial value and state.
      expect(component.inputValue).toBe('initial');
      expect(form.value).toEqual({ inputName: 'initial' });
      expect(control.touched).toBe(false);
      expect(control.pristine).toBe(true);
      expect(form.submitted).toBe(false);

      // Changing the mock leaves its value pending and untouched.
      ngMocks.change(CvaComponent, 'updated');
      // or ngMocks.change(mockControlEl, 'updated');

      expect(component.inputValue).toBe('initial');
      expect(form.value).toEqual({ inputName: 'initial' });
      expect(control.touched).toBe(false);
      expect(control.pristine).toBe(true);

      // Touching the mock also waits for the submit policy.
      ngMocks.touch(mockControlEl);

      expect(component.inputValue).toBe('initial');
      expect(form.value).toEqual({ inputName: 'initial' });
      expect(control.touched).toBe(false);
      expect(control.pristine).toBe(true);
      expect(form.submitted).toBe(false);

      // Submit the form through Angular's native event listener.
      const event = ngMocks.event('submit');
      ngMocks.trigger('form', event);

      // Assert the committed value and state.
      expect(component.inputValue).toBe('updated');
      expect(form.value).toEqual({ inputName: 'updated' });
      expect(control.touched).toBe(true);
      expect(control.dirty).toBe(true);
      expect(form.submitted).toBe(true);
      expect(event.defaultPrevented).toBe(true);
    });
  });
});

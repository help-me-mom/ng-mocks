import {
  Component,
  model,
  reflectComponentType,
  signal,
} from '@angular/core';
import {
  form,
  FormCheckboxControl,
  FormField,
} from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'mock-forms-checkbox-control',
  template: `
    <input
      type="checkbox"
      [checked]="checked()"
      (change)="checked.set($any($event.target).checked)"
    />
  `,
})
class CheckboxControl implements FormCheckboxControl {
  public readonly checked = model(false);
}

@Component({
  selector: 'target-mock-forms-checkbox-signals',
  imports: [FormField, CheckboxControl],
  template:
    '<mock-forms-checkbox-control [formField]="f.checkboxValue" />',
})
class TargetComponent {
  public readonly model = signal({ checkboxValue: false });
  public readonly f = form(this.model);
}

describe('MockForms:checkbox-signals', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular-compiled spread targets exercise the checked model binding.
  if (
    !reflectComponentType(CheckboxControl)?.inputs.some(
      metadata => metadata.propName === 'checked',
    )
  ) {
    it('needs compiled model metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder(TargetComponent)
      // Preserve the parent form connection while replacing the child.
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(CheckboxControl),
  );

  it('passes checked values between the parent and the mocked signal control', () => {
    // Render the parent.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the child.
    const host = ngMocks.find(CheckboxControl);
    const control = ngMocks.get(host, CheckboxControl);
    const checked = control.checked;
    const values: boolean[] = [];
    ngMocks
      .output(host, 'checkedChange')
      .subscribe(value => values.push(value));

    // Read the checked state.
    expect(component.model().checkboxValue).toBe(false);
    expect(control.checked()).toBe(false);

    // Check the control.
    ngMocks.change(CheckboxControl, true);
    // or ngMocks.change(host, true);
    fixture.detectChanges();

    // Assert the result.
    expect(component.model().checkboxValue).toBe(true);
    expect(control.checked()).toBe(true);
    expect(control.checked).toBe(checked);
    expect(values).toEqual([true]);
    expect(component.f.checkboxValue().dirty()).toBe(true);
    expect(component.f.checkboxValue().touched()).toBe(false);

    // Uncheck the control.
    ngMocks.change(CheckboxControl, false);
    // or ngMocks.change(host, false);
    fixture.detectChanges();

    // Assert the result.
    expect(component.model().checkboxValue).toBe(false);
    expect(control.checked()).toBe(false);
    expect(values).toEqual([true, false]);

    // Change the parent model.
    component.model.set({ checkboxValue: true });
    // Deliver the parent value without emitting another child change.
    fixture.detectChanges();

    // Assert the result.
    expect(component.model().checkboxValue).toBe(true);
    expect(control.checked()).toBe(true);
    expect(control.checked).toBe(checked);
    expect(values).toEqual([true, false]);
    expect(component.f.checkboxValue().dirty()).toBe(true);
    expect(component.f.checkboxValue().touched()).toBe(false);
  });
});

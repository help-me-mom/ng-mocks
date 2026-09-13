import {
  Component,
  model,
  reflectComponentType,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormValueControl,
} from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'mock-forms-input-control',
  template: `
    <input
      [value]="value()"
      (input)="value.set($any($event.target).value)"
    />
  `,
})
class InputControl implements FormValueControl<string> {
  public readonly value = model('');
}

@Component({
  selector: 'target-mock-forms-signals',
  imports: [FormField, InputControl],
  template: '<mock-forms-input-control [formField]="f.inputValue" />',
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public readonly f = form(this.model);
}

describe('MockForms:signals', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular-compiled spread targets exercise the signal form model binding.
  if (
    !reflectComponentType(InputControl)?.inputs.some(
      metadata => metadata.propName === 'value',
    )
  ) {
    it('needs compiled model metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder(TargetComponent)
      // Keep the form binding real while replacing the child control.
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(InputControl),
  );

  it('passes values between the parent and the mocked signal control', () => {
    // Render the parent.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the child.
    const host = ngMocks.find(InputControl);
    const control = ngMocks.get(host, InputControl);

    // The bound field tree also identifies the same mocked child.
    expect(
      ngMocks.reveal(['formField', component.f.inputValue]),
    ).toBe(host);
    expect(ngMocks.get(host, FormField).field()).toBe(
      component.f.inputValue,
    );

    // Read the value.
    expect(component.model().inputValue).toBe('Ada');
    expect(control.value()).toBe('Ada');

    // Change the value.
    ngMocks.change(host, 'Grace');
    fixture.detectChanges();

    // Assert the result.
    expect(component.model().inputValue).toBe('Grace');
    expect(control.value()).toBe('Grace');
    expect(component.f.inputValue().dirty()).toBe(true);
    expect(component.f.inputValue().touched()).toBe(false);

    // Change the parent model.
    component.model.set({ inputValue: 'Katherine' });
    fixture.detectChanges();

    // Assert the result.
    expect(component.model().inputValue).toBe('Katherine');
    expect(control.value()).toBe('Katherine');
  });
});

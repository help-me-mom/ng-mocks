import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-form-bindings-signals',
  imports: [FormField],
  template: ` <input [formField]="f.inputValue" /> `,
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public readonly f = form(this.model);
}

describe('MockFormBindings:signals', () => {
  // Mock FormField to inspect its input without connecting it to the DOM.
  beforeEach(() => MockBuilder(TargetComponent).mock(FormField));

  it('preserves a field tree without connecting the native input to it', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input by its field tree.
    const input = ngMocks.reveal([
      'formField',
      component.f.inputValue,
    ]);

    // Read the binding and the parent model.
    expect(isMockOf(ngMocks.get(input, FormField), FormField)).toBe(
      true,
    );
    expect(ngMocks.input(input, 'formField')).toBe(
      component.f.inputValue,
    );
    expect(component.model()).toEqual({ inputValue: 'Ada' });
    expect(input.nativeNode.value).toBe('');

    // A mocked FormField does not connect this input to the field tree.
    try {
      ngMocks.change(input, 'Grace');
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'Cannot find ControlValueAccessor on the element',
      );
    }

    // Assert that the failed change left the model and binding intact.
    expect(component.model()).toEqual({ inputValue: 'Ada' });
    expect(ngMocks.input(input, 'formField')).toBe(
      component.f.inputValue,
    );
    expect(input.nativeNode.value).toBe('');
    expect(component.f.inputValue().dirty()).toBe(false);
    expect(component.f.inputValue().touched()).toBe(false);
  });
});

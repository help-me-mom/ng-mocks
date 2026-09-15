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

  it('changes and touches the real field supplied to a mocked FormField', () => {
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
    expect(component.f.inputValue().dirty()).toBe(false);
    expect(component.f.inputValue().touched()).toBe(false);

    // Change the supplied field without restoring the mocked DOM connection.
    ngMocks.change(input, 'Grace');

    // Assert the model update and dirty state; changing the binding does not touch it.
    expect(component.model()).toEqual({ inputValue: 'Grace' });
    expect(ngMocks.input(input, 'formField')).toBe(
      component.f.inputValue,
    );
    expect(input.nativeNode.value).toBe('');
    expect(component.f.inputValue().dirty()).toBe(true);
    expect(component.f.inputValue().touched()).toBe(false);

    // Touch the supplied field explicitly without dispatching a native blur event.
    ngMocks.touch(input);

    expect(component.f.inputValue().touched()).toBe(true);
    expect(component.f.inputValue().dirty()).toBe(true);
    expect(component.model()).toEqual({ inputValue: 'Grace' });
    expect(ngMocks.input(input, 'formField')).toBe(
      component.f.inputValue,
    );
    expect(input.nativeNode.value).toBe('');
  });

  it('keeps parent writes in the field without synchronizing the native input', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input = ngMocks.reveal([
      'formField',
      component.f.inputValue,
    ]);

    // A parent write updates the real field but does not restore the mocked binding.
    component.model.set({ inputValue: 'Grace' });
    fixture.detectChanges();

    expect(component.f.inputValue().value()).toBe('Grace');
    expect(component.f.inputValue().dirty()).toBe(false);
    expect(component.f.inputValue().touched()).toBe(false);
    expect(ngMocks.input(input, 'formField')).toBe(
      component.f.inputValue,
    );
    expect(input.nativeNode.value).toBe('');
  });
});

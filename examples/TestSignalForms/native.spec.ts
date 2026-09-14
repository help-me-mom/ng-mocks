import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-signal-forms-native',
  imports: [FormField],
  template: '<input [formField]="f.inputValue" />',
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public readonly f = form(this.model);
}

@Component({
  selector: 'signal-forms-native-controls',
  imports: [FormField],
  template: `
    <input [formField]="f.inputValue" />
    <textarea [formField]="f.textareaValue"></textarea>
    <input
      type="checkbox"
      value="yes"
      [formField]="f.checkboxValue"
    />
    <input type="number" [formField]="f.numberValue" />
    <input type="radio" value="first" [formField]="f.radioValue" />
    <input type="radio" value="second" [formField]="f.radioValue" />
    <select [formField]="f.selectValue">
      <option value="first">First</option>
      <option value="second">Second</option>
    </select>
  `,
})
class NativeControlsComponent {
  public readonly model = signal({
    inputValue: 'Ada',
    textareaValue: 'Initial notes',
    checkboxValue: false,
    numberValue: 1 as number | null,
    radioValue: 'first',
    selectValue: 'first',
  });
  public readonly f = form(this.model);
}

describe('TestSignalForms:native', () => {
  describe('text input', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        // Keep the field binding and the services used by native input events.
        .keep(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('finds, reads, and changes a text field', () => {
      // Render the component.
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      // Find the input.
      const input = ngMocks.reveal([
        'formField',
        component.f.inputValue,
      ]);

      // Read the value.
      expect(component.model().inputValue).toBe('Ada');
      expect(component.f.inputValue().value()).toBe('Ada');
      expect(input.nativeNode.value).toBe('Ada');

      // Change the value.
      ngMocks.change(input, 'Grace');
      // Render any bindings that depend on the updated model.
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().inputValue).toBe('Grace');
      expect(component.f.inputValue().value()).toBe('Grace');
      expect(input.nativeNode.value).toBe('Grace');
      expect(component.f.inputValue().dirty()).toBe(true);
      expect(component.f.inputValue().touched()).toBe(true);
    });
  });

  describe('other native controls', () => {
    beforeEach(() =>
      MockBuilder(NativeControlsComponent)
        // Keep the field binding and the services used by native input events.
        .keep(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('finds, reads, and changes a textarea field', () => {
      // Render the component.
      const fixture = MockRender(NativeControlsComponent);
      const component = fixture.point.componentInstance;

      // Find the textarea.
      const textarea = ngMocks.reveal([
        'formField',
        component.f.textareaValue,
      ]);

      // Read the value.
      expect(component.model().textareaValue).toBe('Initial notes');
      expect(component.f.textareaValue().value()).toBe(
        'Initial notes',
      );
      expect(textarea.nativeNode.value).toBe('Initial notes');

      // Change the value.
      ngMocks.change(textarea, 'Updated notes');
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().textareaValue).toBe('Updated notes');
      expect(component.f.textareaValue().value()).toBe(
        'Updated notes',
      );
      expect(textarea.nativeNode.value).toBe('Updated notes');
      expect(component.model().inputValue).toBe('Ada');
    });

    it('finds, reads, checks, and unchecks a checkbox field', () => {
      // Render the component.
      const fixture = MockRender(NativeControlsComponent);
      const component = fixture.point.componentInstance;

      // Find the checkbox.
      const checkbox = ngMocks.reveal([
        'formField',
        component.f.checkboxValue,
      ]);

      // Read the value.
      expect(component.model().checkboxValue).toBe(false);
      expect(component.f.checkboxValue().value()).toBe(false);
      expect(checkbox.nativeNode.checked).toBe(false);

      // Check the checkbox.
      ngMocks.change(checkbox, true);
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().checkboxValue).toBe(true);
      expect(component.f.checkboxValue().value()).toBe(true);
      expect(checkbox.nativeNode.checked).toBe(true);
      expect(checkbox.nativeNode.value).toBe('yes');

      // Uncheck the checkbox.
      ngMocks.change(checkbox, false);
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().checkboxValue).toBe(false);
      expect(component.f.checkboxValue().value()).toBe(false);
      expect(checkbox.nativeNode.checked).toBe(false);
      expect(checkbox.nativeNode.value).toBe('yes');
      expect(component.model().inputValue).toBe('Ada');
    });

    it('finds a radio option and changes its shared field', () => {
      // Render the component.
      const fixture = MockRender(NativeControlsComponent);
      const component = fixture.point.componentInstance;

      // Both options bind the same field tree; select the intended option.
      const first = ngMocks.find<HTMLInputElement>(
        'input[type="radio"][value="first"]',
      );
      const second = ngMocks.find<HTMLInputElement>(
        'input[type="radio"][value="second"]',
      );

      // Read the value.
      expect(ngMocks.get(second, FormField).field()).toBe(
        component.f.radioValue,
      );
      expect(component.model().radioValue).toBe('first');
      expect(component.f.radioValue().value()).toBe('first');
      expect(first.nativeElement.checked).toBe(true);
      expect(second.nativeElement.checked).toBe(false);

      // Select the second option.
      ngMocks.change('input[type="radio"][value="second"]', true);
      // or ngMocks.change(second, true);
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().radioValue).toBe('second');
      expect(component.f.radioValue().value()).toBe('second');
      expect(first.nativeElement.checked).toBe(false);
      expect(second.nativeElement.checked).toBe(true);
      expect(first.nativeElement.value).toBe('first');
      expect(second.nativeElement.value).toBe('second');
      expect(component.model().selectValue).toBe('first');
      expect(component.model().inputValue).toBe('Ada');

      // Uncheck the second option.
      ngMocks.change('input[type="radio"][value="second"]', false);
      // or ngMocks.change(second, false);
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().radioValue).toBe('second');
      expect(component.f.radioValue().value()).toBe('second');
      expect(first.nativeElement.checked).toBe(false);
      expect(second.nativeElement.checked).toBe(false);
      expect(first.nativeElement.value).toBe('first');
      expect(second.nativeElement.value).toBe('second');

      // Select the first option.
      ngMocks.change('input[type="radio"][value="first"]', true);
      // or ngMocks.change(first, true);
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().radioValue).toBe('first');
      expect(component.f.radioValue().value()).toBe('first');
      expect(first.nativeElement.checked).toBe(true);
      expect(second.nativeElement.checked).toBe(false);
      expect(first.nativeElement.value).toBe('first');
      expect(second.nativeElement.value).toBe('second');
      expect(component.model().selectValue).toBe('first');
    });

    it('finds, reads, changes, and clears a numeric field', () => {
      // Render the component.
      const fixture = MockRender(NativeControlsComponent);
      const component = fixture.point.componentInstance;

      // Find the input.
      const input = ngMocks.reveal([
        'formField',
        component.f.numberValue,
      ]);

      // Read the value.
      expect(component.model().numberValue).toBe(1);
      expect(component.f.numberValue().value()).toBe(1);
      expect(input.nativeNode.value).toBe('1');

      // Change the value.
      ngMocks.change(input, 42);
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().numberValue).toBe(42);
      expect(component.f.numberValue().value()).toBe(42);
      expect(input.nativeNode.value).toBe('42');

      // Clear the value.
      ngMocks.change(input, null);
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().numberValue).toBeNull();
      expect(component.f.numberValue().value()).toBeNull();
      expect(input.nativeNode.value).toBe('');
      expect(component.model().checkboxValue).toBe(false);
      expect(component.model().inputValue).toBe('Ada');

      // Undefined clears the native input and Angular keeps the nullable model contract.
      ngMocks.change(input, 42);
      fixture.detectChanges();
      expect(component.f.numberValue().value()).toBe(42);

      // Clear the value.
      ngMocks.change(input, undefined);
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().numberValue).toBeNull();
      expect(component.f.numberValue().value()).toBeNull();
      expect(input.nativeNode.value).toBe('');
      expect(component.model().checkboxValue).toBe(false);
    });

    it('finds, reads, and changes a single-select field', () => {
      // Render the component.
      const fixture = MockRender(NativeControlsComponent);
      const component = fixture.point.componentInstance;

      // Find the select.
      const select = ngMocks.reveal([
        'formField',
        component.f.selectValue,
      ]);

      // Read the value.
      expect(component.model().selectValue).toBe('first');
      expect(component.f.selectValue().value()).toBe('first');
      expect(select.nativeNode.value).toBe('first');

      // Change the value.
      ngMocks.change(select, 'second');
      fixture.detectChanges();

      // Assert the result.
      expect(component.model().selectValue).toBe('second');
      expect(component.f.selectValue().value()).toBe('second');
      expect(select.nativeNode.value).toBe('second');
      expect(select.nativeNode.options[1].selected).toBe(true);
      expect(component.model().radioValue).toBe('first');
      expect(component.model().inputValue).toBe('Ada');
    });
  });
});

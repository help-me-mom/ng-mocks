import { Component } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-native-form-controls',
  template: `
    <input
      #input
      name="inputName"
      [value]="inputValue"
      (input)="inputValue = input.value"
    />
  `,
})
class TargetComponent {
  public inputValue = 'Ada';
}

@Component({
  selector: 'target-native-form-variants',
  template: `
    <input name="inputName" value="Ada" />
    <textarea name="textareaName">Initial notes</textarea>
    <input name="checkboxName" type="checkbox" value="yes" />
    <input name="numberName" type="number" value="1" />
    <input name="radioName" type="radio" value="first" checked />
    <input name="radioName" type="radio" value="second" />
    <select name="selectName">
      <option value="first">First</option>
      <option value="second">Second</option>
    </select>
    <select name="multiSelectName" multiple>
      <option value="first" selected>First</option>
      <option value="second">Second</option>
      <option value="third">Third</option>
    </select>
  `,
})
class VariantsComponent {}

describe('TestNativeFormControls', () => {
  describe('native events', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('finds, reads, and changes an input connected through native events', () => {
      // Render the component.
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      // Find the input.
      const input = ngMocks.find('[name="inputName"]');

      // Read the value.
      expect(input.nativeElement.value).toBe('Ada');
      expect(component.inputValue).toBe('Ada');

      // Change the value.
      ngMocks.change(input, 'Grace');
      fixture.detectChanges();

      // Assert the result.
      expect(input.nativeElement.value).toBe('Grace');
      expect(component.inputValue).toBe('Grace');
    });
  });

  describe('unbound controls', () => {
    beforeEach(() => MockBuilder(VariantsComponent));

    it('reads and changes a plain text input without listeners', () => {
      // Render the component.
      MockRender(VariantsComponent);

      // Find the control.
      const input = ngMocks.find('[name="inputName"]');

      // Read the value.
      expect(input.nativeElement.value).toBe('Ada');

      // Change the value.
      ngMocks.change(input, 'Grace');

      // Assert the result.
      expect(input.nativeElement.value).toBe('Grace');
      expect(ngMocks.find('textarea').nativeElement.value).toBe(
        'Initial notes',
      );
    });

    it('reads and changes a plain textarea without listeners', () => {
      // Render the component.
      MockRender(VariantsComponent);

      // Find the control.
      const textarea = ngMocks.find('[name="textareaName"]');

      // Read the value.
      expect(textarea.nativeElement.value).toBe('Initial notes');

      // Change the value.
      ngMocks.change(textarea, 'Updated notes');

      // Assert the result.
      expect(textarea.nativeElement.value).toBe('Updated notes');
      expect(
        ngMocks.find('[name="inputName"]').nativeElement.value,
      ).toBe('Ada');
    });

    it('reads, checks, and unchecks a plain checkbox', () => {
      // Render the component.
      MockRender(VariantsComponent);

      // Find the control.
      const checkbox = ngMocks.find('[name="checkboxName"]');

      // Read the value.
      expect(checkbox.nativeElement.checked).toBe(false);

      // Check the checkbox.
      ngMocks.change(checkbox, true);

      // Assert the result.
      expect(checkbox.nativeElement.checked).toBe(true);
      expect(checkbox.nativeElement.value).toBe('yes');

      // Uncheck the checkbox.
      ngMocks.change(checkbox, false);

      // Assert the result.
      expect(checkbox.nativeElement.checked).toBe(false);
      expect(checkbox.nativeElement.value).toBe('yes');
    });

    it('reads, changes, and clears a plain number input', () => {
      // Render the component.
      MockRender(VariantsComponent);

      // Find the control.
      const input = ngMocks.find('[name="numberName"]');

      // Read the value.
      expect(input.nativeElement.value).toBe('1');

      // Change the value.
      ngMocks.change(input, 42);

      // Assert the result.
      expect(input.nativeElement.value).toBe('42');

      // Change the value.
      ngMocks.change(input, null);

      // Assert the result.
      expect(input.nativeElement.value).toBe('');
    });

    it('clears a plain number input with undefined', () => {
      // Render the component.
      MockRender(VariantsComponent);

      // Find the control.
      const input = ngMocks.find('[name="numberName"]');

      // Read the value.
      expect(input.nativeElement.value).toBe('1');

      // Change the value.
      ngMocks.change(input, undefined);

      // Assert the result.
      expect(input.nativeElement.value).toBe('');
    });

    it('selects and unchecks a plain radio without changing either option value', () => {
      // Render the component.
      MockRender(VariantsComponent);

      // Find the control.
      const first = ngMocks.find('[name="radioName"][value="first"]');
      const second = ngMocks.find(
        '[name="radioName"][value="second"]',
      );

      // Read the value.
      expect(first.nativeElement.checked).toBe(true);
      expect(second.nativeElement.checked).toBe(false);

      // Select the second option.
      ngMocks.change(second, true);

      // Assert the result.
      expect(first.nativeElement.checked).toBe(false);
      expect(second.nativeElement.checked).toBe(true);
      expect(first.nativeElement.value).toBe('first');
      expect(second.nativeElement.value).toBe('second');

      // Uncheck the second option.
      ngMocks.change(second, false);

      // Assert the result.
      expect(first.nativeElement.checked).toBe(false);
      expect(second.nativeElement.checked).toBe(false);
      expect(first.nativeElement.value).toBe('first');
      expect(second.nativeElement.value).toBe('second');
    });

    it('reads and changes a plain single select', () => {
      // Render the component.
      MockRender(VariantsComponent);

      // Find the control.
      const select = ngMocks.find('[name="selectName"]');

      // Read the value.
      expect(select.nativeElement.value).toBe('first');

      // Change the value.
      ngMocks.change(select, 'second');

      // Assert the result.
      expect(select.nativeElement.value).toBe('second');
      expect(select.nativeElement.options[1].selected).toBe(true);
    });

    it('reads, changes, and clears a plain multiple select', () => {
      // Render the component.
      MockRender(VariantsComponent);

      // Find the control.
      const select = ngMocks.find('[name="multiSelectName"]');
      const element: HTMLSelectElement = select.nativeElement;

      // Read the value.
      expect(element.options[0].selected).toBe(true);
      expect(element.options[1].selected).toBe(false);
      expect(element.options[2].selected).toBe(false);

      // Change the value.
      ngMocks.change(select, ['second', 'third']);

      // Assert the result.
      expect(element.options[0].selected).toBe(false);
      expect(element.options[1].selected).toBe(true);
      expect(element.options[2].selected).toBe(true);
      expect(
        ngMocks.find('[name="selectName"]').nativeElement.value,
      ).toBe('first');

      // Change the value.
      ngMocks.change(select, []);

      // Assert the result.
      expect(element.options[0].selected).toBe(false);
      expect(element.options[1].selected).toBe(false);
      expect(element.options[2].selected).toBe(false);
      expect(element.selectedIndex).toBe(-1);
    });
  });
});

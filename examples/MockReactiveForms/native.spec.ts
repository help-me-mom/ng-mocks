import { Component, NgModule } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-reactive-forms-native',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <input [formControl]="inputValue" />
    <textarea [formControl]="textareaValue"></textarea>
    <input
      type="checkbox"
      value="yes"
      [formControl]="checkboxValue"
    />
    <input type="number" [formControl]="numberValue" />
    <input
      name="radioName"
      type="radio"
      value="first"
      [formControl]="radioValue"
    />
    <input
      name="radioName"
      type="radio"
      value="second"
      [formControl]="radioValue"
    />
    <select [formControl]="selectValue">
      <option value="first">First</option>
      <option value="second">Second</option>
    </select>
    <select multiple [formControl]="multiSelectValue">
      <option value="first">First</option>
      <option value="second">Second</option>
      <option value="third">Third</option>
    </select>
  `,
})
class TargetComponent {
  public readonly inputValue = new FormControl('Ada');
  public readonly textareaValue = new FormControl('Initial notes');
  public readonly checkboxValue = new FormControl(false);
  public readonly numberValue = new FormControl(1);
  public readonly radioValue = new FormControl('first');
  public readonly selectValue = new FormControl('first');
  public readonly multiSelectValue = new FormControl(['first']);
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('MockReactiveForms:native', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(
      ReactiveFormsModule,
    ),
  );

  it('finds, reads, and changes a text control', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.reveal([
      'formControl',
      component.inputValue,
    ]);

    // Read the value.
    expect(component.inputValue.value).toBe('Ada');
    expect(input.nativeNode.value).toBe('Ada');

    // Change the value.
    ngMocks.change(input, 'Grace');
    fixture.detectChanges();

    // Assert the result.
    expect(component.inputValue.value).toBe('Grace');
    expect(input.nativeNode.value).toBe('Grace');
    expect(component.inputValue.dirty).toBe(true);
    expect(component.inputValue.touched).toBe(true);
    expect(component.textareaValue.value).toBe('Initial notes');
    expect(component.textareaValue.dirty).toBe(false);
    expect(component.textareaValue.touched).toBe(false);
  });

  it('touches a native input without changing its value or dirty state', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.reveal([
      'formControl',
      component.inputValue,
    ]);

    // Read the value and state.
    expect(component.inputValue.value).toBe('Ada');
    expect(input.nativeNode.value).toBe('Ada');
    expect(component.inputValue.dirty).toBe(false);
    expect(component.inputValue.touched).toBe(false);

    // Touch the input.
    ngMocks.touch(input);

    // Assert the result.
    expect(component.inputValue.value).toBe('Ada');
    expect(input.nativeNode.value).toBe('Ada');
    expect(component.inputValue.dirty).toBe(false);
    expect(component.inputValue.touched).toBe(true);
    expect(component.textareaValue.value).toBe('Initial notes');
    expect(component.textareaValue.touched).toBe(false);
  });

  it('finds, reads, and changes a textarea control', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the textarea.
    const textarea = ngMocks.reveal([
      'formControl',
      component.textareaValue,
    ]);

    // Read the value.
    expect(component.textareaValue.value).toBe('Initial notes');
    expect(textarea.nativeNode.value).toBe('Initial notes');

    // Change the value.
    ngMocks.change(textarea, 'Updated notes');
    fixture.detectChanges();

    // Assert the result.
    expect(component.textareaValue.value).toBe('Updated notes');
    expect(textarea.nativeNode.value).toBe('Updated notes');
    expect(component.inputValue.value).toBe('Ada');
  });

  it('finds, reads, checks, and unchecks a checkbox control', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the checkbox.
    const checkbox = ngMocks.reveal([
      'formControl',
      component.checkboxValue,
    ]);

    // Read the value.
    expect(component.checkboxValue.value).toBe(false);
    expect(checkbox.nativeNode.checked).toBe(false);

    // Check the checkbox.
    ngMocks.change(checkbox, true);
    fixture.detectChanges();

    // Assert the result.
    expect(component.checkboxValue.value).toBe(true);
    expect(checkbox.nativeNode.checked).toBe(true);
    expect(checkbox.nativeNode.value).toBe('yes');

    // Uncheck the checkbox.
    ngMocks.change(checkbox, false);
    fixture.detectChanges();

    // Assert the result.
    expect(component.checkboxValue.value).toBe(false);
    expect(checkbox.nativeNode.checked).toBe(false);
    expect(checkbox.nativeNode.value).toBe('yes');
    expect(component.inputValue.value).toBe('Ada');
  });

  it('selects and unchecks a radio without clearing its shared control', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the radio options.
    const first = ngMocks.find('[name="radioName"][value="first"]');
    const second = ngMocks.find('[name="radioName"][value="second"]');

    // Read the value.
    expect(ngMocks.input(second, 'formControl')).toBe(
      component.radioValue,
    );
    expect(component.radioValue.value).toBe('first');
    expect(first.nativeElement.checked).toBe(true);
    expect(second.nativeElement.checked).toBe(false);

    // Select the second option.
    ngMocks.change(second, true);
    fixture.detectChanges();

    // Assert the result.
    expect(component.radioValue.value).toBe('second');
    expect(first.nativeElement.checked).toBe(false);
    expect(second.nativeElement.checked).toBe(true);
    expect(first.nativeElement.value).toBe('first');
    expect(second.nativeElement.value).toBe('second');

    // Uncheck the second option.
    ngMocks.change(second, false);
    fixture.detectChanges();

    // Assert the result.
    expect(component.radioValue.value).toBe('second');
    expect(first.nativeElement.checked).toBe(false);
    expect(second.nativeElement.checked).toBe(false);
    expect(first.nativeElement.value).toBe('first');
    expect(second.nativeElement.value).toBe('second');
    expect(component.selectValue.value).toBe('first');
  });

  it('finds, reads, changes, and clears a numeric control', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.reveal([
      'formControl',
      component.numberValue,
    ]);

    // Read the value.
    expect(component.numberValue.value).toBe(1);
    expect(input.nativeNode.value).toBe('1');

    // Change the value.
    ngMocks.change(input, 42);
    fixture.detectChanges();

    // Assert the result.
    expect(component.numberValue.value).toBe(42);
    expect(input.nativeNode.value).toBe('42');

    // Clear the value.
    ngMocks.change(input, null);
    fixture.detectChanges();

    // Assert the result.
    expect(component.numberValue.value).toBeNull();
    expect(input.nativeNode.value).toBe('');
    expect(component.checkboxValue.value).toBe(false);
  });

  it('clears a numeric control with undefined and stores null', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.reveal([
      'formControl',
      component.numberValue,
    ]);

    // Read the value.
    expect(component.numberValue.value).toBe(1);
    expect(input.nativeNode.value).toBe('1');

    // Clear the value.
    ngMocks.change(input, undefined);
    fixture.detectChanges();

    // Assert the result.
    expect(component.numberValue.value).toBeNull();
    expect(input.nativeNode.value).toBe('');
    expect(component.checkboxValue.value).toBe(false);
  });

  it('finds, reads, and changes a single-select control', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the select.
    const select = ngMocks.reveal([
      'formControl',
      component.selectValue,
    ]);

    // Read the value.
    expect(component.selectValue.value).toBe('first');
    expect(select.nativeNode.value).toBe('first');

    // Change the value.
    ngMocks.change(select, 'second');
    fixture.detectChanges();

    // Assert the result.
    expect(component.selectValue.value).toBe('second');
    expect(select.nativeNode.value).toBe('second');
    expect(select.nativeNode.options[1].selected).toBe(true);
    expect(component.radioValue.value).toBe('first');
  });

  it('finds, reads, changes, and clears a multiple-select control', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the select.
    const select = ngMocks.reveal([
      'formControl',
      component.multiSelectValue,
    ]);

    // Read the value.
    expect(component.multiSelectValue.value).toEqual(['first']);
    expect(select.nativeNode.options[0].selected).toBe(true);
    expect(select.nativeNode.options[1].selected).toBe(false);
    expect(select.nativeNode.options[2].selected).toBe(false);

    const values = ['second', 'third'];
    // Change the value.
    ngMocks.change(select, values);
    fixture.detectChanges();

    // Assert the result.
    expect(component.multiSelectValue.value).toEqual([
      'second',
      'third',
    ]);
    expect(select.nativeNode.options[0].selected).toBe(false);
    expect(select.nativeNode.options[1].selected).toBe(true);
    expect(select.nativeNode.options[2].selected).toBe(true);
    expect(values).toEqual(['second', 'third']);

    // Clear the selection.
    ngMocks.change(select, []);
    fixture.detectChanges();

    // Assert the result.
    expect(component.multiSelectValue.value).toEqual([]);
    expect(select.nativeNode.options[0].selected).toBe(false);
    expect(select.nativeNode.options[1].selected).toBe(false);
    expect(select.nativeNode.options[2].selected).toBe(false);
    expect(component.multiSelectValue.dirty).toBe(true);
    expect(component.multiSelectValue.touched).toBe(true);
    expect(component.selectValue.value).toBe('first');
    expect(component.inputValue.value).toBe('Ada');
    expect(component.inputValue.dirty).toBe(false);
    expect(component.inputValue.touched).toBe(false);
  });
});

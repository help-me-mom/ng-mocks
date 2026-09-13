import { Component, NgModule } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-mock-forms-native',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <input name="inputName" [(ngModel)]="inputValue" />
    <textarea
      name="textareaName"
      [(ngModel)]="textareaValue"
    ></textarea>
    <input
      name="checkboxName"
      type="checkbox"
      value="yes"
      [(ngModel)]="checkboxValue"
    />
    <input
      name="radioName"
      type="radio"
      value="first"
      [(ngModel)]="radioValue"
    />
    <input
      name="radioName"
      type="radio"
      value="second"
      [(ngModel)]="radioValue"
    />
    <input
      name="numberName"
      type="number"
      [(ngModel)]="numberValue"
    />
    <select name="selectName" [(ngModel)]="selectValue">
      <option value="first">First</option>
      <option value="second">Second</option>
    </select>
    <select
      name="multiSelectName"
      multiple
      [(ngModel)]="multiSelectValue"
    >
      <option value="first">First</option>
      <option value="second">Second</option>
      <option value="third">Third</option>
    </select>
  `,
})
class TargetComponent {
  public inputValue = 'Ada';
  public textareaValue = 'Notes';
  public checkboxValue = false;
  public radioValue = 'first';
  public numberValue: number | null = 1;
  public selectValue = 'first';
  public multiSelectValue: string[] = ['first'];
}

@NgModule({
  declarations: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}

describe('MockForms:native', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
  );

  it('reads and changes a text input', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.find('[name="inputName"]');
    const control = ngMocks.get(input, NgModel).control;

    // Read the value.
    expect(component.inputValue).toBe('Ada');
    expect(input.nativeElement.value).toBe('Ada');
    expect(control.dirty).toBe(false);
    expect(control.touched).toBe(false);

    // Change the value.
    ngMocks.change(input, 'Grace');
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.inputValue).toBe('Grace');
    expect(input.nativeElement.value).toBe('Grace');
    expect(control.dirty).toBe(true);
    expect(control.touched).toBe(true);
    expect(component.textareaValue).toBe('Notes');
  });

  it('touches a native input without changing its value or dirty state', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.find('[name="inputName"]');
    const control = ngMocks.get(input, NgModel).control;

    // Read the value and state.
    expect(component.inputValue).toBe('Ada');
    expect(input.nativeElement.value).toBe('Ada');
    expect(control.dirty).toBe(false);
    expect(control.touched).toBe(false);

    // Touch the input.
    ngMocks.touch(input);

    // Assert the result.
    expect(component.inputValue).toBe('Ada');
    expect(control.value).toBe('Ada');
    expect(input.nativeElement.value).toBe('Ada');
    expect(control.dirty).toBe(false);
    expect(control.touched).toBe(true);
    expect(component.textareaValue).toBe('Notes');
  });

  it('reads and changes a textarea', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the textarea.
    const textarea = ngMocks.find('[name="textareaName"]');

    // Read the value.
    expect(component.textareaValue).toBe('Notes');
    expect(textarea.nativeElement.value).toBe('Notes');

    // Change the value.
    ngMocks.change(textarea, 'Updated notes');
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.textareaValue).toBe('Updated notes');
    expect(textarea.nativeElement.value).toBe('Updated notes');
    expect(component.inputValue).toBe('Ada');
  });

  it('reads and changes a checkbox', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the checkbox.
    const checkbox = ngMocks.find('[name="checkboxName"]');

    // Read the value.
    expect(component.checkboxValue).toBe(false);
    expect(checkbox.nativeElement.checked).toBe(false);

    // Check the checkbox.
    ngMocks.change(checkbox, true);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.checkboxValue).toBe(true);
    expect(checkbox.nativeElement.checked).toBe(true);
    expect(checkbox.nativeElement.value).toBe('yes');

    // Uncheck the checkbox.
    ngMocks.change(checkbox, false);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.checkboxValue).toBe(false);
    expect(checkbox.nativeElement.checked).toBe(false);
    expect(checkbox.nativeElement.value).toBe('yes');
    expect(component.inputValue).toBe('Ada');
  });

  it('reads a radio group, selects, and unchecks an option', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the radio options.
    const first = ngMocks.find('[name="radioName"][value="first"]');
    const second = ngMocks.find('[name="radioName"][value="second"]');

    // Read the value.
    expect(component.radioValue).toBe('first');
    expect(first.nativeElement.checked).toBe(true);
    expect(second.nativeElement.checked).toBe(false);

    // Select the second option.
    ngMocks.change(second, true);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.radioValue).toBe('second');
    expect(first.nativeElement.checked).toBe(false);
    expect(second.nativeElement.checked).toBe(true);
    expect(first.nativeElement.value).toBe('first');
    expect(second.nativeElement.value).toBe('second');

    // Uncheck the second option.
    ngMocks.change(second, false);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.radioValue).toBe('second');
    expect(first.nativeElement.checked).toBe(false);
    expect(second.nativeElement.checked).toBe(false);
    expect(first.nativeElement.value).toBe('first');
    expect(second.nativeElement.value).toBe('second');
    expect(component.inputValue).toBe('Ada');
  });

  it('reads, changes, and clears a number input', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.find('[name="numberName"]');

    // Read the value.
    expect(component.numberValue).toBe(1);
    expect(input.nativeElement.value).toBe('1');

    // Change the value.
    ngMocks.change(input, 23.5);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.numberValue).toBe(23.5);
    expect(input.nativeElement.value).toBe('23.5');

    // Clear the value.
    ngMocks.change(input, null);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.numberValue).toBeNull();
    expect(input.nativeElement.value).toBe('');
    expect(component.inputValue).toBe('Ada');
  });

  it('clears a number input with undefined and stores null in the model', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the input.
    const input = ngMocks.find('[name="numberName"]');

    // Read the value.
    expect(component.numberValue).toBe(1);
    expect(input.nativeElement.value).toBe('1');

    // Clear the value.
    ngMocks.change(input, undefined);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.numberValue).toBeNull();
    expect(input.nativeElement.value).toBe('');
    expect(component.inputValue).toBe('Ada');
  });

  it('reads and changes a single select', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the select.
    const select = ngMocks.find('[name="selectName"]');

    // Read the value.
    expect(component.selectValue).toBe('first');
    expect(select.nativeElement.value).toBe('first');
    expect(select.nativeElement.options[0].selected).toBe(true);

    // Change the value.
    ngMocks.change(select, 'second');
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.selectValue).toBe('second');
    expect(select.nativeElement.value).toBe('second');
    expect(select.nativeElement.options[0].selected).toBe(false);
    expect(select.nativeElement.options[1].selected).toBe(true);
    expect(component.inputValue).toBe('Ada');
  });

  it('reads, changes, and clears a multiple select', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the select.
    const select = ngMocks.find('[name="multiSelectName"]');

    // Read the value.
    expect(component.multiSelectValue).toEqual(['first']);
    expect(select.nativeElement.options[0].selected).toBe(true);
    expect(select.nativeElement.options[1].selected).toBe(false);
    expect(select.nativeElement.options[2].selected).toBe(false);

    const values = ['second', 'third'];
    // Change the value.
    ngMocks.change(select, values);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.multiSelectValue).toEqual(['second', 'third']);
    expect(select.nativeElement.options[0].selected).toBe(false);
    expect(select.nativeElement.options[1].selected).toBe(true);
    expect(select.nativeElement.options[2].selected).toBe(true);
    expect(values).toEqual(['second', 'third']);

    // Clear the selection.
    ngMocks.change(select, []);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the result.
    expect(component.multiSelectValue).toEqual([]);
    expect(select.nativeElement.options[0].selected).toBe(false);
    expect(select.nativeElement.options[1].selected).toBe(false);
    expect(select.nativeElement.options[2].selected).toBe(false);
    expect(component.selectValue).toBe('first');
    expect(component.inputValue).toBe('Ada');
  });
});

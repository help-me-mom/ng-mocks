import { Component, NgModule } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

interface Option {
  id: number;
  label: string;
}

@Component({
  selector: 'target-ng-mocks-change-multi-select',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <select
      multiple
      [formControl]="choices"
      [compareWith]="compareOptions"
    >
      <option [ngValue]="options[0]">First</option>
      <option [ngValue]="options[1]">Second</option>
      <option [ngValue]="options[2]">Third</option>
    </select>
    <input [formControl]="sibling" />
  `,
})
class TargetComponent {
  public readonly options: Option[] = [
    { id: 1, label: 'First' },
    { id: 2, label: 'Second' },
    { id: 3, label: 'Third' },
  ];
  public readonly choices = new FormControl([this.options[0]]);
  public readonly sibling = new FormControl('unchanged');

  public compareOptions(
    first: Option | null,
    second: Option | null,
  ): boolean {
    return first && second
      ? first.id === second.id
      : first === second;
  }
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('ng-mocks-change:multi-select', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(
      ReactiveFormsModule,
    ),
  );

  it('selects object options through compareWith and changes only that control', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const select = ngMocks.reveal(['formControl', component.choices]);
    const sibling = ngMocks.reveal([
      'formControl',
      component.sibling,
    ]);

    expect(component.choices.value).toEqual([component.options[0]]);
    expect(select.nativeNode.options[0].selected).toBe(true);
    expect(component.choices.dirty).toBe(false);
    expect(component.choices.touched).toBe(false);

    // Recreated model objects must match Angular's options through compareWith.
    ngMocks.change(select, [
      { id: 2, label: 'Recreated second' },
      { id: 3, label: 'Recreated third' },
    ]);
    fixture.detectChanges();

    expect(component.choices.value).toEqual([
      component.options[1],
      component.options[2],
    ]);
    expect(select.nativeNode.options[0].selected).toBe(false);
    expect(select.nativeNode.options[1].selected).toBe(true);
    expect(select.nativeNode.options[2].selected).toBe(true);
    expect(component.choices.dirty).toBe(true);
    expect(component.choices.touched).toBe(true);
    expect(component.sibling.value).toBe('unchanged');
    expect(component.sibling.dirty).toBe(false);
    expect(component.sibling.touched).toBe(false);
    expect(sibling.nativeNode.value).toBe('unchanged');
  });

  it('clears object selections and preserves subsequent parent writes', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const select = ngMocks.reveal(['formControl', component.choices]);
    const element: HTMLSelectElement = select.nativeNode;

    ngMocks.change(select, []);
    fixture.detectChanges();

    expect(component.choices.value).toEqual([]);
    expect(select.nativeNode.options[0].selected).toBe(false);
    expect(select.nativeNode.options[1].selected).toBe(false);
    expect(select.nativeNode.options[2].selected).toBe(false);
    expect(select.nativeNode.selectedIndex).toBe(-1);
    expect(
      Array.prototype.slice
        .call(element.options)
        .filter((option: HTMLOptionElement) => option.selected)
        .map((option: HTMLOptionElement) => option.value),
    ).toEqual([]);
    expect(component.choices.dirty).toBe(true);
    expect(component.choices.touched).toBe(true);
    expect(
      Object.getOwnPropertyDescriptor(select.nativeNode, 'value'),
    ).toBeUndefined();

    const updated = [
      { id: 1, label: 'Recreated first' },
      { id: 3, label: 'Recreated third' },
    ];
    component.choices.setValue(updated);
    fixture.detectChanges();

    expect(component.choices.value).toEqual(updated);
    expect(select.nativeNode.options[0].selected).toBe(true);
    expect(select.nativeNode.options[1].selected).toBe(false);
    expect(select.nativeNode.options[2].selected).toBe(true);
    expect(component.choices.dirty).toBe(true);
    expect(component.choices.touched).toBe(true);
    expect(component.sibling.value).toBe('unchanged');
    expect(component.sibling.dirty).toBe(false);
    expect(component.sibling.touched).toBe(false);
    expect(
      Object.getOwnPropertyDescriptor(select.nativeNode, 'value'),
    ).toBeUndefined();
  });
});

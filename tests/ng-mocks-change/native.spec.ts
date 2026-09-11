import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-change-native',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <input id="checkbox" type="checkbox" [formControl]="enabled" />
    <input id="number" type="number" [formControl]="amount" />
    <select [formControl]="choice">
      <option value="first">First</option>
      <option value="second">Second</option>
    </select>
    <input id="text" [formControl]="text" />
  `,
})
class TargetComponent {
  public readonly enabled = new FormControl(false);
  public readonly amount = new FormControl(1);
  public readonly choice = new FormControl('first');
  public readonly text = new FormControl('initial');
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14909
describe('ng-mocks-change:native', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [TargetModule] }),
  );

  it('updates a classic checkbox through checked without changing other controls', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#checkbox').nativeElement;
    const values: any[] = [];
    const subscription = component.enabled.valueChanges.subscribe(
      value => values.push(value),
    );

    ngMocks.change('#checkbox', true);
    expect(component.enabled.value).toBe(true);
    expect(input.checked).toBe(true);
    expect(input.value).toBe('on');

    ngMocks.change('#checkbox', false);
    subscription.unsubscribe();

    expect(component.enabled.value).toBe(false);
    expect(input.checked).toBe(false);
    expect(component.enabled.dirty).toBe(true);
    expect(component.enabled.touched).toBe(true);
    expect(values).toEqual([true, false]);
    expect(component.amount.value).toBe(1);
    expect(component.amount.dirty).toBe(false);
    expect(component.amount.touched).toBe(false);
  });

  it('keeps numeric CVA parsing and the native value in sync', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#number').nativeElement;

    ngMocks.change('#number', '23.5');

    expect(component.amount.value).toBe(23.5);
    expect(input.value).toBe('23.5');
    expect(component.amount.dirty).toBe(true);
    expect(component.amount.touched).toBe(true);

    ngMocks.change('#number', null);

    expect(component.amount.value).toBeNull();
    expect(input.value).toBe('');
  });

  it('updates numeric controls without creating a synthetic valueAsNumber property', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#number').nativeElement;

    ngMocks.change('#number', 42);

    expect(component.amount.value).toBe(42);
    expect(input.value).toBe('42');
    expect(
      Object.getOwnPropertyDescriptor(input, 'valueAsNumber'),
    ).toBeUndefined();
  });

  it('updates the selected option and keeps subsequent control writes functional', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const select =
      ngMocks.find<HTMLSelectElement>('select').nativeElement;

    ngMocks.change('select', 'second');

    expect(component.choice.value).toBe('second');
    expect(select.selectedIndex).toBe(1);
    expect(select.options[1].selected).toBe(true);

    component.choice.setValue('first');

    expect(select.value).toBe('first');
    expect(select.selectedIndex).toBe(0);
  });

  it('preserves raw text CVA values while retaining the native value setter', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#text').nativeElement;

    // Existing ngMocks.change calls can send a number through a text accessor.
    ngMocks.change('#text', 123);

    expect(component.text.value).toEqual(123 as never);
    expect(input.value).toBe('123');

    component.text.setValue('updated');

    expect(input.value).toBe('updated');
    expect(
      Object.getOwnPropertyDescriptor(input, 'value'),
    ).toBeUndefined();
  });
});

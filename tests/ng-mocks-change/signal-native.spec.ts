import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';

import { MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-change-signal-native',
  standalone: true,
  imports: [FormField],
  template: `
    <input id="checkbox" type="checkbox" [formField]="f.enabled" />
    <input id="number" type="number" [formField]="f.amount" />
    <input id="range" type="range" [formField]="f.range" />
    <input id="date" type="date" [formField]="f.date" />
    <input id="timestamp" type="date" [formField]="f.timestamp" />
    <input id="date-text" type="date" [formField]="f.dateText" />
    <input
      id="datetime"
      type="datetime-local"
      [formField]="f.datetime"
    />
    <input
      id="first"
      type="radio"
      value="first"
      [formField]="f.choice"
    />
    <input
      id="second"
      type="radio"
      value="second"
      [formField]="f.choice"
    />
    <select [formField]="f.selection">
      <option value="first">First</option>
      <option value="second">Second</option>
    </select>
    <input id="name" [formField]="f.name" />
  `,
})
class TargetComponent {
  public readonly model = signal({
    enabled: false,
    amount: 1 as number | null,
    range: 5,
    date: new Date('2024-01-01T00:00:00.000Z') as Date | null,
    timestamp: Date.UTC(2024, 0, 1),
    dateText: '2024-01-01',
    datetime: Date.UTC(2024, 0, 1, 12),
    choice: 'first',
    selection: 'first',
    name: 'unchanged',
  });
  public readonly f = form(this.model);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14909
describe('ng-mocks-change:signal-native', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [TargetComponent] }),
  );

  it('preserves Date parsing across native input events before using helpers', () => {
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const input = fixture.nativeElement.querySelector(
      '#date',
    ) as HTMLInputElement;

    input.value = '2024-06-15';
    input.dispatchEvent(new Event('input'));

    expect(component.model().date instanceof Date).toBe(true);
    expect(component.model().date).toEqual(
      new Date('2024-06-15T00:00:00.000Z'),
    );

    input.value = '';
    input.dispatchEvent(new Event('input'));

    expect(component.model().date).toBeNull();
    expect(input.valueAsDate).toBeNull();
  });

  it('checks and unchecks a field without replacing its option value', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#checkbox').nativeElement;

    ngMocks.change('#checkbox', true);

    expect(component.model().enabled).toBe(true);
    expect(input.checked).toBe(true);
    expect(input.value).toBe('on');
    expect(component.f.enabled().dirty()).toBe(true);
    expect(component.f.enabled().touched()).toBe(true);
    expect(component.f.name().dirty()).toBe(false);
    expect(component.f.name().touched()).toBe(false);

    ngMocks.change('#checkbox', false);

    expect(component.model().enabled).toBe(false);
    expect(input.checked).toBe(false);
    expect(component.model().name).toBe('unchanged');
  });

  it('updates a numeric field through the browser value and can clear it', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#number').nativeElement;

    // Angular reads valueAsNumber, which must reflect the simulated edit.
    ngMocks.change('#number', 42);

    expect(component.model().amount).toBe(42);
    expect(input.valueAsNumber).toBe(42);
    expect(input.value).toBe('42');
    expect(component.f.amount().dirty()).toBe(true);
    expect(component.f.amount().touched()).toBe(true);
    expect(component.model().name).toBe('unchanged');

    ngMocks.change('#number', null);

    expect(component.model().amount).toBeNull();
    expect(input.value).toBe('');
  });

  it('parses numeric text using the native input setter', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#number').nativeElement;

    ngMocks.change('#number', '23.5');

    expect(component.model().amount).toBe(23.5);
    expect(input.valueAsNumber).toBe(23.5);

    component.model.update(value => ({ ...value, amount: 7 }));
    fixture.detectChanges();

    expect(input.value).toBe('7');
    expect(input.valueAsNumber).toBe(7);
  });

  it('updates a range without changing another numeric field', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#range').nativeElement;

    ngMocks.change('#range', 27);

    expect(component.model().range).toBe(27);
    expect(input.valueAsNumber).toBe(27);
    expect(component.model().amount).toBe(1);
    expect(component.f.amount().dirty()).toBe(false);
  });

  it('updates a Date field and clears it through native date handling', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#date').nativeElement;
    const value = new Date('2024-06-15T00:00:00.000Z');

    ngMocks.change('#date', value);

    expect(component.model().date).toEqual(value);
    expect(input.valueAsDate).toEqual(value);
    expect(input.value).toBe('2024-06-15');
    expect(component.f.date().dirty()).toBe(true);
    expect(component.f.date().touched()).toBe(true);

    ngMocks.change('#date', null);

    expect(component.model().date).toBeNull();
    expect(input.valueAsDate).toBeNull();
    expect(input.value).toBe('');
  });

  it('preserves numeric date models', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#timestamp').nativeElement;
    const value = Date.UTC(2024, 5, 15);

    ngMocks.change('#timestamp', value);

    expect(component.model().timestamp).toBe(value);
    expect(input.valueAsNumber).toBe(value);
    expect(input.value).toBe('2024-06-15');
    expect(component.model().date).toEqual(
      new Date('2024-01-01T00:00:00.000Z'),
    );
  });

  it('preserves string date models while updating the real native value', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#date-text').nativeElement;

    ngMocks.change('#date-text', '2024-06-15');

    expect(component.model().dateText).toBe('2024-06-15');
    expect(input.valueAsDate).toEqual(
      new Date('2024-06-15T00:00:00.000Z'),
    );
  });

  it('updates numeric datetime models through valueAsNumber', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#datetime').nativeElement;
    const value = Date.UTC(2024, 5, 15, 13, 30);

    ngMocks.change('#datetime', value);

    expect(component.model().datetime).toBe(value);
    expect(input.valueAsNumber).toBe(value);
    expect(component.f.datetime().dirty()).toBe(true);
    expect(component.f.datetime().touched()).toBe(true);
  });

  it('selects a radio option while retaining both option values', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const first =
      ngMocks.find<HTMLInputElement>('#first').nativeElement;
    const second =
      ngMocks.find<HTMLInputElement>('#second').nativeElement;

    ngMocks.change('#second', 'second');
    fixture.detectChanges();

    expect(component.model().choice).toBe('second');
    expect(first.checked).toBe(false);
    expect(second.checked).toBe(true);
    expect(first.value).toBe('first');
    expect(second.value).toBe('second');
  });

  it('changes the selected option and preserves subsequent model-to-view updates', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const select =
      ngMocks.find<HTMLSelectElement>('select').nativeElement;

    ngMocks.change('select', 'second');

    expect(component.model().selection).toBe('second');
    expect(select.selectedIndex).toBe(1);
    expect(select.options[1].selected).toBe(true);

    fixture.detectChanges();
    component.model.update(value => ({
      ...value,
      selection: 'first',
    }));
    fixture.detectChanges();

    expect(select.value).toBe('first');
    expect(select.selectedIndex).toBe(0);
    expect(component.model().name).toBe('unchanged');
  });

  it('touches a checkbox without changing checked state or marking it dirty', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const input =
      ngMocks.find<HTMLInputElement>('#checkbox').nativeElement;

    ngMocks.touch('#checkbox');

    expect(component.model().enabled).toBe(false);
    expect(input.checked).toBe(false);
    expect(component.f.enabled().touched()).toBe(true);
    expect(component.f.enabled().dirty()).toBe(false);
    expect(component.f.name().touched()).toBe(false);
  });
});

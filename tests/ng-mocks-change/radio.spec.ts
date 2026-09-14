import { Component, NgModule } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-change-radio',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <input
      name="stringRadio"
      type="radio"
      value="first"
      [formControl]="stringValue"
    />
    <input
      name="stringRadio"
      type="radio"
      value="second"
      [formControl]="stringValue"
    />
    <input
      name="numberRadio"
      type="radio"
      [value]="42"
      [formControl]="numberValue"
    />
    <input
      name="objectRadio"
      type="radio"
      [value]="option"
      [formControl]="objectValue"
    />
    <input
      name="booleanRadio"
      type="radio"
      [value]="false"
      [formControl]="booleanValue"
    />
  `,
})
class TargetComponent {
  public readonly option = { id: 1 };
  public readonly stringValue = new FormControl('first');
  public readonly numberValue = new FormControl(0);
  public readonly objectValue = new FormControl(null);
  public readonly booleanValue = new FormControl(true);
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('ng-mocks-change:radio', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(
      ReactiveFormsModule,
    ),
  );

  it('checks and unchecks an option without emitting an unchecked selection', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const first = ngMocks.find('[name="stringRadio"][value="first"]');
    const second = ngMocks.find(
      '[name="stringRadio"][value="second"]',
    );
    const values: Array<string | null> = [];
    const subscription = component.stringValue.valueChanges.subscribe(
      value => values.push(value),
    );

    ngMocks.change(second, true);
    fixture.detectChanges();

    expect(component.stringValue.value).toBe('second');
    expect(first.nativeElement.checked).toBe(false);
    expect(second.nativeElement.checked).toBe(true);
    expect(first.nativeElement.value).toBe('first');
    expect(second.nativeElement.value).toBe('second');

    // Angular treats every radio change event as selecting that option, even if unchecked.
    ngMocks.change(first, false);
    fixture.detectChanges();

    expect(component.stringValue.value).toBe('second');
    expect(second.nativeElement.checked).toBe(true);

    ngMocks.change(second, false);
    fixture.detectChanges();
    subscription.unsubscribe();

    expect(component.stringValue.value).toBe('second');
    expect(first.nativeElement.checked).toBe(false);
    expect(second.nativeElement.checked).toBe(false);
    expect(values).toEqual(['second']);

    component.stringValue.setValue('first');
    fixture.detectChanges();

    expect(first.nativeElement.checked).toBe(true);
    expect(second.nativeElement.checked).toBe(false);
  });

  it('checks a numeric option while retaining its typed model value', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const radio = ngMocks.find('[name="numberRadio"]');
    const nativeValue = radio.nativeElement.value;

    ngMocks.change(radio, true);
    fixture.detectChanges();

    expect(component.numberValue.value).toBe(42);
    expect(radio.nativeElement.checked).toBe(true);
    expect(radio.nativeElement.value).toBe(nativeValue);

    ngMocks.change(radio, false);
    fixture.detectChanges();

    expect(component.numberValue.value).toBe(42);
    expect(radio.nativeElement.checked).toBe(false);
    expect(radio.nativeElement.value).toBe(nativeValue);
  });

  it('preserves legacy nonboolean radio calls and their raw native value', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const radio = ngMocks.find(
      '[name="stringRadio"][value="second"]',
    );
    const values: Array<string | null> = [];
    const subscription = component.stringValue.valueChanges.subscribe(
      value => values.push(value),
    );

    // The legacy event path forwards the argument; Angular's accessor selects its bound option.
    ngMocks.change(radio, 'different');
    fixture.detectChanges();
    subscription.unsubscribe();

    expect(component.stringValue.value).toBe('second');
    expect(values).toEqual(['second']);
    expect(radio.nativeElement.value).toBe('different');
    expect(radio.nativeElement.checked).toBe(false);
  });

  it('checks an object option while retaining its model identity', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const radio = ngMocks.find('[name="objectRadio"]');
    const nativeValue = radio.nativeElement.value;

    ngMocks.change(radio, true);
    fixture.detectChanges();

    expect(component.objectValue.value).toBe(
      component.option as never,
    );
    expect(radio.nativeElement.checked).toBe(true);
    expect(radio.nativeElement.value).toBe(nativeValue);

    ngMocks.change(radio, false);
    fixture.detectChanges();

    expect(component.objectValue.value).toBe(
      component.option as never,
    );
    expect(radio.nativeElement.checked).toBe(false);
    expect(radio.nativeElement.value).toBe(nativeValue);
  });

  it('checks a false-valued option with true and unchecks it with false', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const radio = ngMocks.find('[name="booleanRadio"]');
    const nativeValue = radio.nativeElement.value;
    const values: Array<boolean | null> = [];
    const subscription =
      component.booleanValue.valueChanges.subscribe(value =>
        values.push(value),
      );

    expect(component.booleanValue.value).toBe(true);
    expect(radio.nativeElement.checked).toBe(false);

    ngMocks.change(radio, true);
    fixture.detectChanges();

    expect(component.booleanValue.value).toBe(false);
    expect(radio.nativeElement.checked).toBe(true);
    expect(radio.nativeElement.value).toBe(nativeValue);

    ngMocks.change(radio, false);
    fixture.detectChanges();
    subscription.unsubscribe();

    expect(component.booleanValue.value).toBe(false);
    expect(radio.nativeElement.checked).toBe(false);
    expect(radio.nativeElement.value).toBe(nativeValue);
    expect(values).toEqual([false]);
  });
});

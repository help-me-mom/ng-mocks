import { Component, Directive, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: 'input[type=radio][customRadio]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  host: {
    '(change)': 'changeValue($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CvaDirective,
      multi: true,
    },
  ],
})
class CvaDirective implements ControlValueAccessor {
  public value = '';
  public onChange: (value: string) => void = () => undefined;
  public onTouched: () => void = () => undefined;

  public writeValue(value: string): void {
    this.value = value;
  }

  public registerOnChange(callback: (value: string) => void): void {
    this.onChange = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }

  public changeValue(value: string): void {
    this.value = value;
    this.onChange(value);
  }
}

@Component({
  selector: 'target-ng-mocks-change-radio-custom',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <input
      customRadio
      type="radio"
      value="option"
      [formControl]="control"
    />
  `,
})
class TargetComponent {
  public readonly control = new FormControl('current');
}

@NgModule({
  declarations: [TargetComponent, CvaDirective],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('ng-mocks-change:radio-custom', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule)
      .keep(ReactiveFormsModule)
      .keep(CvaDirective),
  );

  it('uses the native option instead of a custom accessor current value', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const radio = ngMocks.find(CvaDirective);
    const accessor = ngMocks.get(radio, CvaDirective);

    expect(ngMocks.get(radio, NgControl).valueAccessor).toBe(
      accessor,
    );
    // A custom accessor's value can represent its current model, not its option.
    expect(accessor.value).toBe('current');
    expect(radio.nativeElement.value).toBe('option');
    expect(radio.nativeElement.checked).toBe(false);

    ngMocks.change(radio, true);
    fixture.detectChanges();

    expect(component.control.value).toBe('option');
    expect(accessor.value).toBe('option');
    expect(radio.nativeElement.checked).toBe(true);
    expect(radio.nativeElement.value).toBe('option');
  });

  it('preserves nonboolean value events for a custom native radio accessor', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const radio = ngMocks.find(CvaDirective);
    const accessor = ngMocks.get(radio, CvaDirective);

    ngMocks.change(radio, 'updated');
    fixture.detectChanges();

    expect(component.control.value).toBe('updated');
    expect(accessor.value).toBe('updated');
    expect(radio.nativeElement.value).toBe('updated');
    expect(radio.nativeElement.checked).toBe(false);
  });
});

import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-signal-forms-native-multiple-select',
  imports: [FormField],
  template: `
    <!-- Deliberately bypass the native binding's type contract to show why arrays need a custom control. -->
    <select multiple [formField]="$any(f.multiSelectValue)">
      <option value="first">First</option>
      <option value="second">Second</option>
      <option value="third">Third</option>
    </select>
  `,
})
class TargetComponent {
  public readonly model = signal({
    multiSelectValue: ['first', 'third'],
    inputValue: 'Ada',
  });
  public readonly f = form(this.model);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14985
describe('TestSignalForms:native-multiple-select', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS),
  );

  it('reads one native value instead of preserving an array selection', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const select = ngMocks.find<HTMLSelectElement>('select');

    expect(component.model().multiSelectValue).toEqual([
      'first',
      'third',
    ]);
    // The native binding writes select.value, which cannot render an array of options.
    expect(select.nativeElement.selectedIndex).toBe(-1);
    expect(select.nativeElement.options[0].selected).toBe(false);
    expect(select.nativeElement.options[1].selected).toBe(false);
    expect(select.nativeElement.options[2].selected).toBe(false);

    select.nativeElement.options[1].selected = true;
    select.nativeElement.options[2].selected = true;
    select.nativeElement.dispatchEvent(new Event('input'));

    // Inspect the runtime value because this deliberately unsupported binding breaks its array type.
    const value: unknown = component.model().multiSelectValue;
    expect(value).toBe('second');
    expect(select.nativeElement.options[1].selected).toBe(true);
    expect(select.nativeElement.options[2].selected).toBe(true);

    fixture.detectChanges();

    expect(select.nativeElement.value).toBe('second');
    expect(select.nativeElement.options[0].selected).toBe(false);
    expect(select.nativeElement.options[1].selected).toBe(true);
    expect(select.nativeElement.options[2].selected).toBe(false);
    expect(component.model().inputValue).toBe('Ada');
  });
});

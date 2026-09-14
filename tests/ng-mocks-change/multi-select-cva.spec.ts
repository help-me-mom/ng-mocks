import {
  Component,
  Directive,
  forwardRef,
  NgModule,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Directive({
  selector: 'select[multiple][customSelect]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaDirective),
      multi: true,
    },
  ],
})
class CvaDirective implements ControlValueAccessor {
  public registerOnChange(): void {}
  public registerOnTouched(): void {}
  public writeValue(): void {}
}

@Component({
  selector: 'target-ng-mocks-change-multi-select-cva',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <select multiple customSelect [formControl]="choices">
      <option value="first">First</option>
      <option value="second">Second</option>
      <option value="third">Third</option>
    </select>
  `,
})
class TargetComponent {
  public readonly choices = new FormControl(['first']);
}

@NgModule({
  declarations: [TargetComponent, CvaDirective],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('ng-mocks-change:multi-select-cva', () => {
  MockInstance.scope();

  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule)
      .keep(ReactiveFormsModule)
      .mock(CvaDirective),
  );

  it('does not turn a mocked select change into an extra writeValue call', () => {
    // Observe the initial parent write before rendering the mock.
    const writeValue =
      typeof jest === 'undefined'
        ? jasmine.createSpy('writeValue')
        : jest.fn();
    MockInstance(CvaDirective, 'writeValue', writeValue);

    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const select = ngMocks.find(CvaDirective);

    expect(component.choices.value).toEqual(['first']);
    expect(writeValue).toHaveBeenCalledTimes(1);
    expect(writeValue).toHaveBeenCalledWith(['first']);

    // Simulate the mock's registered change callback, not a parent write.
    ngMocks.change(select, ['second', 'third']);
    fixture.detectChanges();

    expect(component.choices.value).toEqual(['second', 'third']);
    expect(writeValue).toHaveBeenCalledTimes(1);
    expect(writeValue).not.toHaveBeenCalledWith(['second', 'third']);

    // A later parent update must still reach the same mocked accessor.
    component.choices.setValue(['third']);
    fixture.detectChanges();

    expect(component.choices.value).toEqual(['third']);
    expect(writeValue).toHaveBeenCalledTimes(2);
    expect(writeValue).toHaveBeenCalledWith(['third']);
  });
});

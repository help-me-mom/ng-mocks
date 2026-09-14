import { Component, forwardRef, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
    },
  ],
  selector: 'cva',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'dependency',
})
class CvaComponent implements ControlValueAccessor {
  public registerOnChange(): void {}
  public registerOnTouched(): void {}
  public writeValue(): void {}

  public cvaMockForms() {}
}

@Component({
  selector: 'target',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<cva [(ngModel)]="value"></cva>',
})
class TargetComponent {
  public value: string | null = null;

  public targetMockForms() {}
}

@NgModule({
  imports: [FormsModule],
  declarations: [TargetComponent, CvaComponent],
})
class ItsModule {}

describe('MockForms', () => {
  // Helps to reset customizations after each test.
  // Alternatively, you can enable
  // automatic resetting in test.ts.
  MockInstance.scope();

  beforeEach(() =>
    MockBuilder(TargetComponent, ItsModule).keep(FormsModule),
  );

  it('sends the correct value to the mock form component', async () => {
    // Prepare the writeValue spy before rendering.
    const writeValue =
      typeof jest === 'undefined'
        ? jasmine.createSpy('writeValue')
        : jest.fn();
    MockInstance(CvaComponent, 'writeValue', writeValue);

    // Render the component.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Find the mocked control.
    const mockControlEl = ngMocks.find(CvaComponent);

    // Read the initial value and the write received by the mock.
    expect(component.value).toBeNull();
    expect(writeValue).toHaveBeenCalledWith(null);

    // Change the value through the mocked control.
    ngMocks.change(mockControlEl, 'foo');

    // Assert the result.
    expect(component.value).toBe('foo');

    // Change the parent value.
    component.value = 'bar';
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the value written to the mocked control.
    expect(component.value).toBe('bar');
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});

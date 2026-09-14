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

  // Keep ngModel real so it connects the parent to the mocked CVA child.
  beforeEach(() =>
    MockBuilder(TargetComponent, ItsModule).keep(FormsModule),
  );

  it('sends the correct value to the mock form component', async () => {
    // Observe values written to the child. With auto spy, a manual spy is unnecessary.
    const writeValue =
      typeof jest === 'undefined'
        ? jasmine.createSpy('writeValue')
        : jest.fn();
    // Install the spy before rendering to capture Angular's initial write.
    MockInstance(CvaComponent, 'writeValue', writeValue);

    // Render the parent.
    const fixture = MockRender(TargetComponent);
    // Wait for ngModel to register the control and write its initial value.
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Read the initial value and the write received by the mock.
    expect(component.value).toBeNull();
    expect(writeValue).toHaveBeenCalledWith(null);

    // Find the child by its class and simulate an edit.
    ngMocks.change(CvaComponent, 'foo');

    // Assert that ngModel updated the parent property.
    expect(component.value).toBe('foo');

    // Change the parent value to exercise the opposite direction.
    component.value = 'bar';
    // Run the binding and wait for ngModel to write the value to the child.
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert the value written to the mocked control.
    expect(component.value).toBe('bar');
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});

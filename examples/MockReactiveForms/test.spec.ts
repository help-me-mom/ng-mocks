import { Component, forwardRef, NgModule } from '@angular/core';
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
  public setDisabledState(): void {}
  public writeValue(): void {}

  public cvaMockReactiveForms() {}
}

@Component({
  selector: 'target',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<cva [formControl]="formControl"></cva>',
})
class TargetComponent {
  public readonly formControl = new FormControl();

  public targetMockReactiveForms() {}
}

@NgModule({
  imports: [ReactiveFormsModule],
  declarations: [TargetComponent, CvaComponent],
})
class ItsModule {}

describe('MockReactiveForms', () => {
  // Helps to reset MockInstance customizations after each test.
  MockInstance.scope();

  beforeEach(() =>
    MockBuilder(TargetComponent, ItsModule).keep(ReactiveFormsModule),
  );

  it('sends the correct value to the mock form component', () => {
    // Prepare the writeValue spy before rendering.
    const writeValue =
      typeof jest === 'undefined'
        ? jasmine.createSpy('writeValue')
        : jest.fn();
    MockInstance(CvaComponent, 'writeValue', writeValue);

    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the mocked control.
    const mockControlEl = ngMocks.find(CvaComponent);

    // Read the initial value and the write received by the mock.
    expect(component.formControl.value).toBeNull();
    expect(writeValue).toHaveBeenCalledWith(null);

    // Change the value through the mocked control.
    ngMocks.change(mockControlEl, 'foo');

    // Assert the result.
    expect(component.formControl.value).toBe('foo');

    // Change the parent value.
    component.formControl.setValue('bar');

    // Assert the value written to the mocked control.
    expect(component.formControl.value).toBe('bar');
    expect(writeValue).toHaveBeenCalledWith('bar');
  });

  it('touches the mocked control without changing its value', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const mockControlEl = ngMocks.find(CvaComponent);

    expect(component.formControl.touched).toBe(false);
    expect(component.formControl.pristine).toBe(true);

    ngMocks.touch(mockControlEl);

    expect(component.formControl.touched).toBe(true);
    expect(component.formControl.pristine).toBe(true);
    expect(component.formControl.value).toBeNull();
  });

  it('passes disabled state to the mock without changing its value or interaction state', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const mockControlEl = ngMocks.find(CvaComponent);
    const setDisabledState =
      typeof jest === 'undefined'
        ? jasmine.createSpy('setDisabledState')
        : jest.fn();
    ngMocks.stubMember(
      ngMocks.get(mockControlEl, CvaComponent),
      'setDisabledState',
      setDisabledState,
    );

    expect(component.formControl.enabled).toBe(true);

    // Disable the real control and observe the call to its mocked child.
    component.formControl.disable();

    expect(component.formControl.disabled).toBe(true);
    expect(setDisabledState).toHaveBeenCalledTimes(1);
    expect(setDisabledState).toHaveBeenCalledWith(true);
    expect(component.formControl.value).toBeNull();
    expect(component.formControl.pristine).toBe(true);
    expect(component.formControl.touched).toBe(false);

    // Enabling the control also reaches the same child.
    component.formControl.enable();

    expect(component.formControl.enabled).toBe(true);
    expect(setDisabledState).toHaveBeenCalledTimes(2);
    expect(setDisabledState).toHaveBeenCalledWith(false);
    expect(component.formControl.value).toBeNull();
    expect(component.formControl.pristine).toBe(true);
    expect(component.formControl.touched).toBe(false);
  });
});

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
  template: 'dependency',
})
class CvaComponent implements ControlValueAccessor {
  public registerOnChange = (fn: any): void => fn;
  public registerOnTouched = (fn: any): void => fn;
  public writeValue = (obj: any): void => obj;

  public cvaMockReactiveForms() {}
}

@Component({
  selector: 'target',
  template: ' <cva [formControl]="formControl"></cva> ',
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

  beforeEach(() => {
    // DependencyComponent is a declaration in ItsModule.
    return (
      MockBuilder(TargetComponent, ItsModule)
        // ReactiveFormsModule is an import in ItsModule.
        .keep(ReactiveFormsModule)
    );
  });

  it('sends the correct value to the mock form component', () => {
    // That is our spy on writeValue calls.
    // With auto spy this code is not needed.
    const writeValue =
      typeof jest === 'undefined'
        ? jasmine.createSpy('writeValue')
        : jest.fn();
    // in case of jest
    // const writeValue = jest.fn();

    // Because of early calls of writeValue, we need to install
    // the spy via MockInstance before the render.
    MockInstance(CvaComponent, 'writeValue', writeValue);

    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // During initialization, it should be called
    // with null.
    expect(writeValue).toHaveBeenCalledWith(null);

    // Let's find the form control element
    // and simulate its change, like a user does it.
    const mockControlEl = ngMocks.find(CvaComponent);
    ngMocks.change(mockControlEl, 'foo');
    expect(component.formControl.value).toBe('foo');

    // Let's check that change on existing formControl
    // causes calls of `writeValue` on the mock component.
    component.formControl.setValue('bar');
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});

// tslint:disable:prefer-function-over-method

import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DependencyComponent),
    },
  ],
  selector: 'app-child',
  template: `dependency`,
})
class DependencyComponent implements ControlValueAccessor {
  registerOnChange(fn: any): void {}

  registerOnTouched(fn: any): void {}

  writeValue(obj: any): void {}
}

@Component({
  selector: 'tested',
  template: ` <app-child [formControl]="formControl"></app-child> `,
})
class TestedComponent {
  formControl = new FormControl();
}

describe('MockReactiveForms', () => {
  beforeEach(() => MockBuilder(TestedComponent).mock(DependencyComponent).keep(ReactiveFormsModule));

  it('sends the correct value to the mocked form component', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mocked form component.
    const mockedControl = ngMocks.find(fixture.debugElement, DependencyComponent).componentInstance;

    // Let's simulate its change, like a user does it.
    if (isMockOf(mockedControl, DependencyComponent, 'c')) {
      mockedControl.__simulateChange('foo');
    }
    expect(component.formControl.value).toBe('foo');

    // Let's check that change on existing formControl
    // causes calls of `writeValue` on the mocked component.
    spyOn(mockedControl, 'writeValue');
    component.formControl.setValue('bar');
    expect(mockedControl.writeValue).toHaveBeenCalledWith('bar');
  });
});

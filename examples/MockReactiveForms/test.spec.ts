import { Component, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
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
  public registerOnChange = (fn: any): void => fn;
  public registerOnTouched = (fn: any): void => fn;
  public writeValue = (obj: any): void => obj;
}

@Component({
  selector: 'tested',
  template: ` <app-child [formControl]="formControl"></app-child> `,
})
class TestedComponent {
  public readonly formControl = new FormControl();
}

describe('MockReactiveForms', () => {
  beforeEach(() => {
    return MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(ReactiveFormsModule);
  });

  it('sends the correct value to the mock form component', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mock form component.
    const mockControl = ngMocks.find(DependencyComponent)
      .componentInstance;

    // Let's simulate its change, like a user does it.
    if (isMockOf(mockControl, DependencyComponent, 'c')) {
      mockControl.__simulateChange('foo');
    }
    expect(component.formControl.value).toBe('foo');

    // Let's check that change on existing formControl
    // causes calls of `writeValue` on the mock component.
    spyOn(mockControl, 'writeValue');
    component.formControl.setValue('bar');
    expect(mockControl.writeValue).toHaveBeenCalledWith('bar');
  });
});

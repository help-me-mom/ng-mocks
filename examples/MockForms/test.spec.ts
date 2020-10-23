// tslint:disable:prefer-function-over-method

import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
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
  template: ` <app-child [ngModel]="value" (ngModelChange)="value = $event"></app-child> `,
})
class TestedComponent {
  value: any;
}

describe('MockForms', () => {
  beforeEach(() => MockBuilder(TestedComponent).mock(DependencyComponent).keep(FormsModule));

  it('sends the correct value to the mocked form component', async () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mocked form component.
    const mockedControl = ngMocks.find(fixture.debugElement, DependencyComponent).componentInstance;

    // Let's simulate its change, like a user does it.
    if (isMockOf(mockedControl, DependencyComponent, 'c')) {
      mockedControl.__simulateChange('foo');
      fixture.detectChanges();
      await fixture.whenStable();
    }
    expect(component.value).toBe('foo');

    // Let's check that change on existing formControl
    // causes calls of `writeValue` on the mocked component.
    spyOn(mockedControl, 'writeValue');
    component.value = 'bar';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mockedControl.writeValue).toHaveBeenCalledWith('bar');
  });
});

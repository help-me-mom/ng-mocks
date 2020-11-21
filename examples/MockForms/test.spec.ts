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
  public registerOnChange = (fn: any): void => fn;
  public registerOnTouched = (fn: any): void => fn;
  public writeValue = (obj: any): void => obj;
}

@Component({
  selector: 'tested',
  template: ` <app-child [ngModel]="value" (ngModelChange)="value = $event"></app-child> `,
})
class TestedComponent {
  public value: any;
}

describe('MockForms', () => {
  beforeEach(() => MockBuilder(TestedComponent).mock(DependencyComponent).keep(FormsModule));

  it('sends the correct value to the mock form component', async () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mock form component.
    const mockControl = ngMocks.find(fixture.debugElement, DependencyComponent).componentInstance;

    // Let's simulate its change, like a user does it.
    if (isMockOf(mockControl, DependencyComponent, 'c')) {
      mockControl.__simulateChange('foo');
      fixture.detectChanges();
      await fixture.whenStable();
    }
    expect(component.value).toBe('foo');

    // Let's check that change on existing value
    // causes calls of `writeValue` on the mock component.
    spyOn(mockControl, 'writeValue');
    component.value = 'bar';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mockControl.writeValue).toHaveBeenCalledWith('bar');
  });
});

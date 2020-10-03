import { Component, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MockBuilder, MockedComponent, MockRender, ngMocks } from 'ng-mocks';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DependencyComponent),
    },
  ],
  selector: 'dependency-component-selector',
  template: `dependency`,
})
class DependencyComponent {}

@Component({
  selector: 'tested',
  template: ` <dependency-component-selector [formControl]="formControl"></dependency-component-selector> `,
})
class TestedComponent {
  formControl = new FormControl();
}

describe('v10:MockReactiveForms', () => {
  beforeEach(() => MockBuilder(TestedComponent).mock(DependencyComponent).keep(ReactiveFormsModule));

  it('should send the correct value to the dependency component input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    const mockedReactiveFormComponent = ngMocks.find<MockedComponent<DependencyComponent>>(
      fixture.debugElement,
      'dependency-component-selector'
    ).componentInstance;

    mockedReactiveFormComponent.__simulateChange('foo');
    expect(component.formControl.value).toBe('foo');

    spyOn(mockedReactiveFormComponent, 'writeValue');
    component.formControl.setValue('bar');
    expect(mockedReactiveFormComponent.writeValue).toHaveBeenCalledWith('bar');
  });
});

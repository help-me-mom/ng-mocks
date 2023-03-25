import { Component, NgModule } from '@angular/core';
import {
  DefaultValueAccessor,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-305-overrides',
  template: `
    <input data-testid="inputControl" [formControl]="myControl" />
  `,
})
class TargetComponent {
  public readonly myControl = new FormControl();
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/305
describe('issue-305:overrides', () => {
  MockInstance.scope();

  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(TargetModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly overrides CVA', () => {
    const registerOnChange =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    const registerOnTouched =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    const setDisabledState =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    const writeValue =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();

    MockInstance(DefaultValueAccessor, () => ({
      registerOnChange,
      registerOnTouched,
      setDisabledState,
      writeValue,
    }));

    const fixture = MockRender(TargetComponent);

    expect(registerOnChange).toHaveBeenCalled();
    expect(registerOnTouched).toHaveBeenCalled();
    expect(writeValue).toHaveBeenCalledWith(null);

    const component = fixture.point.componentInstance;
    expect(writeValue).not.toHaveBeenCalledWith(123);
    component.myControl.setValue(123);
    fixture.detectChanges();
    expect(writeValue).toHaveBeenCalledWith(123);

    component.myControl.disable();
    fixture.detectChanges();
    expect(setDisabledState).toHaveBeenCalledWith(true);
  });
});

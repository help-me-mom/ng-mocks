import { Component, NgModule } from '@angular/core';
import {
  DefaultValueAccessor,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';

@Component({
  selector: 'my',
  template: `
    <input data-testid="inputControl" [formControl]="myControl" />
  `,
})
class MyComponent {
  public readonly myControl = new FormControl();
}

@NgModule({
  declarations: [MyComponent],
  exports: [MyComponent],
  imports: [ReactiveFormsModule],
})
class MyModule {}

describe('issue-305:overrides', () => {
  MockInstance.scope();

  beforeEach(() =>
    MockBuilder(MyComponent)
      .keep(MyModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly overrides CVA', () => {
    const registerOnChange = jasmine.createSpy('registerOnChange');
    const registerOnTouched = jasmine.createSpy('registerOnTouched');
    const setDisabledState = jasmine.createSpy('setDisabledState');
    const writeValue = jasmine.createSpy('writeValue');

    MockInstance(DefaultValueAccessor, () => ({
      registerOnChange,
      registerOnTouched,
      setDisabledState,
      writeValue,
    }));

    const fixture = MockRender(MyComponent);

    expect(registerOnChange).toHaveBeenCalled();
    expect(registerOnTouched).toHaveBeenCalled();
    expect(writeValue).toHaveBeenCalledWith(null);

    const component = fixture.point.componentInstance;
    expect(writeValue).not.toHaveBeenCalledWith(123);
    component.myControl.setValue(123);
    fixture.detectChanges();
    expect(writeValue).toHaveBeenCalledWith(123);

    expect(setDisabledState).not.toHaveBeenCalled();
    component.myControl.disable();
    fixture.detectChanges();
    expect(setDisabledState).toHaveBeenCalled();
  });
});

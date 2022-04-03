import { Component, NgModule } from '@angular/core';
import {
  DefaultValueAccessor,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  isMockControlValueAccessor,
  MockBuilder,
  MockRender,
  ngMocks,
} from 'ng-mocks';

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

// checking how normal form works
// @see https://github.com/ike18t/ng-mocks/issues/305
describe('issue-305:reactive-forms:real', () => {
  beforeEach(() => MockBuilder(MyComponent).keep(MyModule));

  it('correctly mocks CVA', () => {
    const component = MockRender(MyComponent).point.componentInstance;

    // DefaultValueAccessor does implement ControlValueAccessor
    const valueAccessor = ngMocks.get(
      ngMocks.find(['data-testid', 'inputControl']),
      DefaultValueAccessor,
    );

    // normal touch
    expect(component.myControl.touched).toEqual(false);
    valueAccessor.onTouched();
    expect(component.myControl.touched).toEqual(true);

    // normal change
    expect(component.myControl.value).toEqual(null);
    valueAccessor.onChange(123);
    expect(component.myControl.value).toEqual(123);
  });
});

// a mock version should behavior similarly but via our own interface
// @see https://github.com/ike18t/ng-mocks/issues/305
describe('issue-305:reactive-forms:mock', () => {
  beforeEach(() =>
    MockBuilder(MyComponent)
      .keep(MyModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly mocks CVA', () => {
    const fixture = MockRender(MyComponent);

    const component = fixture.point.componentInstance;

    // DefaultValueAccessor does implement ControlValueAccessor
    const valueAccessor = ngMocks.get(
      ngMocks.find(['data-testid', 'inputControl']),
      DefaultValueAccessor,
    );

    // normal touch
    expect(component.myControl.touched).toEqual(false);
    if (isMockControlValueAccessor(valueAccessor)) {
      valueAccessor.__simulateTouch();
    }
    expect(component.myControl.touched).toEqual(true);

    // normal change
    expect(component.myControl.value).toEqual(null);
    if (isMockControlValueAccessor(valueAccessor)) {
      valueAccessor.__simulateChange(123);
    }
    expect(component.myControl.value).toEqual(123);
  });
});

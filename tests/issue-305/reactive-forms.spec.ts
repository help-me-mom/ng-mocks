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
  selector: 'target-305-reactive-forms',
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

// checking how normal form works
// @see https://github.com/help-me-mom/ng-mocks/issues/305
describe('issue-305:reactive-forms:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('correctly mocks CVA', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;

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
// @see https://github.com/help-me-mom/ng-mocks/issues/305
describe('issue-305:reactive-forms:mock', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(TargetModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly mocks CVA', () => {
    const fixture = MockRender(TargetComponent);

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

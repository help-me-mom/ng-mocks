import { Component, NgModule } from '@angular/core';
import { DefaultValueAccessor, FormsModule } from '@angular/forms';

import {
  isMockControlValueAccessor,
  MockBuilder,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-305-forms',
  template: `
    <input data-testid="inputControl" [(ngModel)]="value" />
  `,
})
class TargetComponent {
  public value: number | null = null;
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}

// checking how normal form works
describe('issue-305:forms:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('correctly mocks CVA', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;

    // DefaultValueAccessor does implement ControlValueAccessor
    const valueAccessor = ngMocks.get(
      ngMocks.find(['data-testid', 'inputControl']),
      DefaultValueAccessor,
    );

    // normal change
    expect(component.value).toEqual(null);
    valueAccessor.onChange(123);
    expect(component.value).toEqual(123);
  });
});

// a mock version should behavior similarly but via our own interface
// @see https://github.com/help-me-mom/ng-mocks/issues/305
describe('issue-305:forms:mock', () => {
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

    // normal change
    expect(component.value).toEqual(null);
    if (isMockControlValueAccessor(valueAccessor)) {
      valueAccessor.__simulateChange(123);
    }
    expect(component.value).toEqual(123);
  });
});

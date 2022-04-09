import { Component, NgModule } from '@angular/core';
import { DefaultValueAccessor, FormsModule } from '@angular/forms';

import {
  isMockControlValueAccessor,
  MockBuilder,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'my',
  template: `
    <input data-testid="inputControl" [(ngModel)]="value" />
  `,
})
class MyComponent {
  public value: number | null = null;
}

@NgModule({
  declarations: [MyComponent],
  exports: [MyComponent],
  imports: [FormsModule],
})
class MyModule {}

// checking how normal form works
describe('issue-305:forms:real', () => {
  beforeEach(() => MockBuilder(MyComponent).keep(MyModule));

  it('correctly mocks CVA', () => {
    const component = MockRender(MyComponent).point.componentInstance;

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
// @see https://github.com/ike18t/ng-mocks/issues/305
describe('issue-305:forms:mock', () => {
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

    // normal change
    expect(component.value).toEqual(null);
    if (isMockControlValueAccessor(valueAccessor)) {
      valueAccessor.__simulateChange(123);
    }
    expect(component.value).toEqual(123);
  });
});

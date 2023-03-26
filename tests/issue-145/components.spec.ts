import { Component } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'component1',
  template: '',
})
class DefaultComponent {}

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: ValueAccessorComponent,
    },
  ],
  selector: 'component2',
  template: '',
})
class ValueAccessorComponent {}

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALIDATORS,
      useExisting: ValidatorComponent,
    },
  ],
  selector: 'component3',
  template: '',
})
class ValidatorComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/145
describe('issue-145:components', () => {
  ngMocks.faster();

  beforeAll(() =>
    MockBuilder()
      .mock(DefaultComponent)
      .mock(ValueAccessorComponent)
      .mock(ValidatorComponent),
  );

  it('does not add NG_VALUE_ACCESSOR to components', () => {
    const mock = MockRender(DefaultComponent);
    expect(() =>
      ngMocks.get(mock.point, DefaultComponent),
    ).not.toThrow();
  });

  it('adds NG_VALUE_ACCESSOR to components that provide it', () => {
    const mock = MockRender(ValueAccessorComponent);
    expect(() =>
      ngMocks.get(mock.point, ValueAccessorComponent),
    ).not.toThrow();
    expect(() =>
      ngMocks.get(mock.point, NG_VALUE_ACCESSOR),
    ).not.toThrow();
  });

  it('respects NG_VALIDATORS too', () => {
    const mock = MockRender(ValidatorComponent);
    expect(() =>
      ngMocks.get(mock.point, ValidatorComponent),
    ).not.toThrow();
    expect(() =>
      ngMocks.get(mock.point, NG_VALIDATORS),
    ).not.toThrow();
  });
});

import { Directive } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: 'directive1',
})
class DefaultDirective {}

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: ValueAccessorDirective,
    },
  ],
  selector: 'directive2',
})
class ValueAccessorDirective {}

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALIDATORS,
      useExisting: ValidatorDirective,
    },
  ],
  selector: 'directive3',
})
class ValidatorDirective {}

// providers should be added to directives only in case if they were specified in the original directive.
// @see https://github.com/help-me-mom/ng-mocks/issues/145
describe('issue-145:directives', () => {
  ngMocks.faster();

  beforeAll(() =>
    MockBuilder()
      .mock(DefaultDirective)
      .mock(ValueAccessorDirective)
      .mock(ValidatorDirective),
  );

  it('does not add NG_VALUE_ACCESSOR to directives', () => {
    const mock = MockRender(DefaultDirective);
    expect(() =>
      ngMocks.get(mock.point, DefaultDirective),
    ).not.toThrow();
  });

  it('adds NG_VALUE_ACCESSOR to directives that provide it', () => {
    const mock = MockRender(ValueAccessorDirective);
    expect(() =>
      ngMocks.get(mock.point, ValueAccessorDirective),
    ).not.toThrow();
    expect(() =>
      ngMocks.get(mock.point, NG_VALUE_ACCESSOR),
    ).not.toThrow();
  });

  it('respects NG_VALIDATORS too', () => {
    const mock = MockRender(ValidatorDirective);
    expect(() =>
      ngMocks.get(mock.point, ValidatorDirective),
    ).not.toThrow();
    expect(() =>
      ngMocks.get(mock.point, NG_VALIDATORS),
    ).not.toThrow();
  });
});

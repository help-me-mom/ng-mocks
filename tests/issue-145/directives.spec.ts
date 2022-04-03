import { Directive } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: 'directive1',
})
export class DirectiveDefault {}

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: DirectiveValueAccessor,
    },
  ],
  selector: 'directive2',
})
export class DirectiveValueAccessor {}

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALIDATORS,
      useExisting: DirectiveValidator,
    },
  ],
  selector: 'directive3',
})
export class DirectiveValidator {}

// providers should be added to directives only in case if they were specified in the original directive.
// @see https://github.com/ike18t/ng-mocks/issues/145
describe('issue-145:directives', () => {
  ngMocks.faster();

  beforeAll(() =>
    MockBuilder()
      .mock(DirectiveDefault)
      .mock(DirectiveValueAccessor)
      .mock(DirectiveValidator),
  );

  it('does not add NG_VALUE_ACCESSOR to directives', () => {
    const mock = MockRender(DirectiveDefault);
    expect(() =>
      ngMocks.get(mock.point, DirectiveDefault),
    ).not.toThrow();
  });

  it('adds NG_VALUE_ACCESSOR to directives that provide it', () => {
    const mock = MockRender(DirectiveValueAccessor);
    expect(() =>
      ngMocks.get(mock.point, DirectiveValueAccessor),
    ).not.toThrow();
    expect(() =>
      ngMocks.get(mock.point, NG_VALUE_ACCESSOR),
    ).not.toThrow();
  });

  it('respects NG_VALIDATORS too', () => {
    const mock = MockRender(DirectiveValidator);
    expect(() =>
      ngMocks.get(mock.point, DirectiveValidator),
    ).not.toThrow();
    expect(() =>
      ngMocks.get(mock.point, NG_VALIDATORS),
    ).not.toThrow();
  });
});

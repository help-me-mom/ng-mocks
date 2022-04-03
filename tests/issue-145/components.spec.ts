import { Component } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'component1',
  template: '',
})
export class ComponentDefault {}

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: ComponentValueAccessor,
    },
  ],
  selector: 'component2',
  template: '',
})
export class ComponentValueAccessor {}

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALIDATORS,
      useExisting: ComponentValidator,
    },
  ],
  selector: 'component3',
  template: '',
})
export class ComponentValidator {}

// @see https://github.com/ike18t/ng-mocks/issues/145
describe('issue-145:components', () => {
  ngMocks.faster();

  beforeAll(() =>
    MockBuilder()
      .mock(ComponentDefault)
      .mock(ComponentValueAccessor)
      .mock(ComponentValidator),
  );

  it('does not add NG_VALUE_ACCESSOR to components', () => {
    const mock = MockRender(ComponentDefault);
    expect(() =>
      ngMocks.get(mock.point, ComponentDefault),
    ).not.toThrow();
  });

  it('adds NG_VALUE_ACCESSOR to components that provide it', () => {
    const mock = MockRender(ComponentValueAccessor);
    expect(() =>
      ngMocks.get(mock.point, ComponentValueAccessor),
    ).not.toThrow();
    expect(() =>
      ngMocks.get(mock.point, NG_VALUE_ACCESSOR),
    ).not.toThrow();
  });

  it('respects NG_VALIDATORS too', () => {
    const mock = MockRender(ComponentValidator);
    expect(() =>
      ngMocks.get(mock.point, ComponentValidator),
    ).not.toThrow();
    expect(() =>
      ngMocks.get(mock.point, NG_VALIDATORS),
    ).not.toThrow();
  });
});

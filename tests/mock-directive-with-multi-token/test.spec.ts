import { Directive, InjectionToken } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@Directive({
  providers: [
    {
      multi: true,
      provide: TOKEN,
      useValue: true,
    },
  ],
  selector: 'target-mock-directive-with-multi-token',
})
class TargetDirective {}

describe('mock-directive-with-multi-token', () => {
  beforeEach(() => MockBuilder(null, TargetDirective));

  it('does not have the token', () => {
    expect(() =>
      MockRender(
        '<target-mock-directive-with-multi-token></target-mock-directive-with-multi-token>',
      ),
    ).not.toThrow();
  });
});

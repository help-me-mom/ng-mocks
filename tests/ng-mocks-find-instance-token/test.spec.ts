import { Component, InjectionToken } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@Component({
  providers: [
    {
      provide: TOKEN,
      useExisting: TargetComponent,
    },
  ],
  selector: 'target-ng-mocks-find-instance-token',
  template: 'target',
})
class TargetComponent {}

describe('ng-mocks-find-instance-token', () => {
  beforeEach(() => MockBuilder().mock(TargetComponent));

  it('does not fail on TOKEN', () => {
    MockRender(TargetComponent);
    const targetEl = ngMocks.find(TargetComponent);

    expect(() => ngMocks.input(targetEl, 'fail')).toThrowError(
      'Cannot find fail input via ngMocks.input',
    );
  });
});

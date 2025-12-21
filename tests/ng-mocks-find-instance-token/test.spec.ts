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
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'target',
})
class TargetComponent {}

describe('ng-mocks-find-instance-token', () => {
  beforeEach(() => MockBuilder().mock(TargetComponent));

  it('does not fail on TOKEN', () => {
    MockRender(TargetComponent);
    const targetEl = ngMocks.find(TargetComponent);

    try {
      ngMocks.input(targetEl, 'fail');
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'Cannot find fail input via ngMocks.input',
      );
    }
  });
});

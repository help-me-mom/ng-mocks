import { Component } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-10306',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real',
})
class TargetComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/10306
// Angular 19 treats missing standalone property as true by default.
// It caused issues in how MockRender generates a wrapper component and other mocks.
// This fix respects new behavior and sets standalone flag accordingly.
describe('issue-10306', () => {
  describe('MockRender', () => {
    ngMocks.throwOnConsole();

    beforeEach(() => MockBuilder(null, TargetComponent));

    it('does not throw forgot to flush TestBed', () => {
      expect(() => MockRender(TargetComponent)).not.toThrow();
    });
  });
});

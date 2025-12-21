import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-857',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'target',
})
class Target857Component {}

@NgModule({
  declarations: [Target857Component],
  exports: [Target857Component],
})
class TargetModule {}

ngMocks.globalExclude(`@${Target857Component.name}` as never);

// @see https://github.com/help-me-mom/ng-mocks/issues/857
describe('issue-857:string', () => {
  ngMocks.throwOnConsole('error');
  beforeEach(() => MockBuilder(null, TargetModule));

  it('excludes by string', () => {
    try {
      MockRender(Target857Component);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `'target-857' is not a known element`,
      );
    }
  });
});

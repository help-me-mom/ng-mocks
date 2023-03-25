import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-857',
  template: 'target',
})
class Target857Component {}

@NgModule({
  declarations: [Target857Component],
  exports: [Target857Component],
})
class TargetModule {}

ngMocks.globalExclude('@Target857Component' as never);

// @see https://github.com/help-me-mom/ng-mocks/issues/857
describe('issue-857:string', () => {
  ngMocks.throwOnConsole('error');
  beforeEach(() => MockBuilder(null, TargetModule));

  it('excludes by string', () => {
    expect(() => MockRender(Target857Component)).toThrowError(
      /'target-857' is not a known element/,
    );
  });
});

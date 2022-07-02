import { ApplicationRef, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MockBuilder, ngMocks } from 'ng-mocks';

@NgModule({
  imports: [BrowserModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/222
describe('issue-222:application-module', () => {
  beforeEach(() => MockBuilder(null, TargetModule));

  it('does not mock its guts', () => {
    const service = ngMocks.findInstance(ApplicationRef);
    expect(service.viewCount).toBeDefined();
  });
});

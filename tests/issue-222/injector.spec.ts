import { Component, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class MockService {}

@Component({
  selector: 'target-222-injector',
  template: 'target',
})
class TargetComponent {
  public constructor(public readonly service: MockService) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [BrowserModule],
  providers: [MockService],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/222
describe('issue-222:Injector', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('does not mock Injector, fails on ivy only', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance.service).toBeDefined();
  });
});

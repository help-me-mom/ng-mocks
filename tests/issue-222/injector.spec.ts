import { Component, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class MockService {}

@Component({
  selector: 'target',
  template: `target`,
})
class TargetComponent {
  public readonly service: MockService;

  public constructor(service: MockService) {
    this.service = service;
  }
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [BrowserModule],
  providers: [MockService],
})
class TargetModule {}

describe('issue-222:Injector', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('does not mock Injector, fails on ivy only', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance.service).toBeDefined();
  });
});

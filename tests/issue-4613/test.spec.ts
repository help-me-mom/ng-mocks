import { Component, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder } from 'ng-mocks';

@Injectable()
class TargetService {}

@Component({
  selector: 'target-4613',
  template: '{{ service.constructor.name }}',
})
class TargetComponent {
  constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {
  static forRoot() {
    return {
      ngModule: TargetModule,
      providers: [TargetService],
    };
  }
}

@NgModule({
  imports: [TargetModule],
})
class DependencyModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4613
describe('issue-4613', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, [
      TargetModule.forRoot(),
      DependencyModule,
    ]),
  );

  it('should create component', () => {
    expect(TestBed.createComponent(TargetComponent)).toBeTruthy();
  });
});

import { Component, Directive, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Directive({
  selector: 'target-2647',
})
class TargetDirective {}

@NgModule({
  declarations: [TargetDirective],
  exports: [TargetDirective],
})
class DirectiveModule {}

@NgModule({
  imports: [DirectiveModule],
})
class MiddleModule {}

@Component({
  selector: 'target-2647',
  template: `{{ directive.constructor.name }}`,
})
class TargetComponent {
  constructor(public readonly directive: TargetDirective) {}
}

@NgModule({
  imports: [DirectiveModule],
  declarations: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/2647
describe('issue-2647', () => {
  describe('chain', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .mock(MiddleModule)
        .keep(DirectiveModule),
    );

    it('exports the service', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component.directive).toBeDefined();
    });
  });

  describe('params', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(
        DirectiveModule,
      ),
    );

    it('exports the service', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component.directive).toBeDefined();
    });
  });
});

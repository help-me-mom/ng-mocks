import { CommonModule } from '@angular/common';
import { Component, Directive, NgModule } from '@angular/core';

import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';

@Directive({
  selector: 'target-2087',
})
class MockDirective {
  public readonly boolean = false;
  public readonly number = 0;
  public readonly string = '';
}

@Component({
  selector: 'target-2087',
  template: '',
})
class TargetComponent {
  public constructor(public readonly mock: MockDirective) {}
}

@NgModule({
  declarations: [TargetComponent, MockDirective],
  imports: [CommonModule],
})
class TargetModule {}

// MockInstance doesn't provide falsy values.
// @see https://github.com/help-me-mom/ng-mocks/issues/2087
describe('issue-2087', () => {
  MockInstance.scope();
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  const tests: Array<[keyof MockDirective, any, any]> = [
    ['string', '', 'test'],
    ['number', 0, 1],
    ['boolean', false, true],
  ];

  for (const [kind, falsy, truthy] of tests) {
    describe(kind, () => {
      it('works for falsy', () => {
        MockInstance(MockDirective, kind, falsy);
        const fixture = MockRender(TargetComponent);
        expect(fixture.componentInstance.mock[kind]).toEqual(falsy);
      });

      it('works for truthy', () => {
        MockInstance(MockDirective, kind, truthy);
        const fixture = MockRender(TargetComponent);
        expect(fixture.componentInstance.mock[kind]).toEqual(truthy);
      });
    });
  }
});

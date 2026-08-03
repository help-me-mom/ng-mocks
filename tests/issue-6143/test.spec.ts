import { CommonModule } from '@angular/common';
import { Component, forwardRef } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/6143
// Regression coverage for #6143:
// - this standalone child imports its standalone parent via forwardRef
// - the parent imports the child directly
//
// Angular 15.0.0 through 15.2.3 recursively traverse this graph before TestBed
// applies ng-mocks overrides. Angular 15.2.4 fixed that upstream traversal, and
// this spec protects the same graph on the fixed Angular matrix.
@Component({
  selector: 'issue-6143-child',
  template: 'ChildComponent',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    CommonModule,
    forwardRef(() => ParentComponent),
  ],
})
class ChildComponent {}

@Component({
  selector: 'issue-6143-parent',
  template: 'ParentComponent',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    CommonModule,
    ChildComponent,
  ],
})
class ParentComponent {}

describe('issue-6143', () => {
  describe('ChildComponent', () => {
    beforeEach(() => MockBuilder(ChildComponent));

    it('renders without recursive parsing failures', () => {
      const fixture = MockRender(ChildComponent);

      expect(ngMocks.formatText(fixture)).toEqual('ChildComponent');
    });
  });

  describe('ParentComponent', () => {
    beforeEach(() => MockBuilder(ParentComponent));

    it('renders its own standalone graph', () => {
      const fixture = MockRender(ParentComponent);

      expect(ngMocks.formatText(fixture)).toEqual('ParentComponent');
    });
  });
});

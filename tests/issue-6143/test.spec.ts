import { CommonModule } from '@angular/common';
import { Component, forwardRef, VERSION } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// Regression coverage for #6143:
// - this standalone child imports its standalone parent via forwardRef
// - the parent imports the child directly
//
// The same setup fails with a recursive stack overflow on v14.7.1 for the
// Angular 15 line reported in the issue, but current main should keep rendering
// both sides of the standalone graph correctly.
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
  if (Number.parseInt(VERSION.major, 10) < 15) {
    it('needs >=a15', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

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

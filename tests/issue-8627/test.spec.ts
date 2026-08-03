import { Component, forwardRef } from '@angular/core';

import { MockComponent } from 'ng-mocks';

@Component({
  selector: 'issue-8627-recursive',
  template: 'dependency',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    RecursiveComponent,
  ],
})
class RecursiveComponent {}

@Component({
  selector: 'issue-8627-cycle-a',
  template: 'cycle-a',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    forwardRef(() => CycleBComponent),
  ],
})
class CycleAComponent {}

@Component({
  selector: 'issue-8627-cycle-b',
  template: 'cycle-b',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    CycleAComponent,
  ],
})
class CycleBComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/8627
// A standalone declaration can reference itself directly or through a longer import cycle.
// Mock construction has to track its current path and omit back-edges from mock metadata,
// otherwise ng-mocks or Angular recursively parses the same declarations until the stack overflows.
describe('issue-8627', () => {
  it('mocks a standalone component that imports itself', () => {
    const mock = MockComponent(RecursiveComponent);

    expect(mock).not.toBe(RecursiveComponent);
  });

  it('mocks both sides of a standalone dependency cycle', () => {
    const mockA = MockComponent(CycleAComponent);
    const mockB = MockComponent(CycleBComponent);

    expect(mockA).not.toBe(CycleAComponent);
    expect(mockB).not.toBe(CycleBComponent);
  });
});

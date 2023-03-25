import { Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockRender } from 'ng-mocks';

class RecursiveDirective {}
Directive({
  selector: 'recursive',
  providers: [
    {
      provide: RecursiveDirective,
      useExisting: RecursiveDirective,
    },
  ],
})(RecursiveDirective);

@Directive({
  selector: 'target-2095',
  providers: [
    {
      provide: RecursiveDirective,
      useValue: null,
    },
  ],
})
class TargetDirective {}

// When ng-mocks generates touches, it can meet recursions when a declaration provides itself in own providers.
// In this case, ng-mocks shouldn't cause infinity loop.
describe('issue-3095', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetDirective],
    }).compileComponents(),
  );

  it('renders directive', () => {
    const fixture = MockRender(TargetDirective);
    expect(() =>
      fixture.point.injector.get(RecursiveDirective),
    ).not.toThrow();
  });
});

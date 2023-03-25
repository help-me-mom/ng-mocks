import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-222-common-module',
  template: 'target',
})
class TargetComponent {}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [CommonModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/222
describe('issue-222:CommonModule', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MockModule(CommonModule),
        MockModule(TargetModule),
      ],
    }),
  );

  it('correctly handles kept and the mock CommonModule', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target-222-common-module></target-222-common-module>',
    );
  });
});

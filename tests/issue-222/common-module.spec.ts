import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockModule, MockRender } from 'ng-mocks';

@Component({
  selector: 'target',
  template: `target`,
})
class TargetComponent {}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [CommonModule],
})
class TargetModule {}

// @see https://github.com/ike18t/ng-mocks/issues/222
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
      '<target></target>',
    );
  });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder } from 'ng-mocks';

@Component({
  selector: 'app-reproduction',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template: `
    <div>
      <input type="text" [formControl]="control" />
    </div>
  `,
})
class ReproductionComponent {
  public readonly control = new FormControl();
}

// https://github.com/help-me-mom/ng-mocks/issues/302
// The problem derives from internal usage of injector with NgControl.
// Because internal usage hides priorities,
// it is possible that a mock instance wants to get NgControl,
// but a mock directive which provides NgControl isn't yet initialized.
// Then Angular wrongly initializes it as undefined and EVERYTHING FAILS.
describe('issue-302', () => {
  beforeEach(() =>
    MockBuilder(ReproductionComponent, ReactiveFormsModule),
  );

  it('should create', () => {
    const fixture = TestBed.createComponent(ReproductionComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

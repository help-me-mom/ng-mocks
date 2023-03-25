import { APP_BASE_HREF } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-222-app-initializer',
  template: '<router-outlet></router-outlet>',
})
class TargetComponent {}

@NgModule({
  declarations: [TargetComponent],
  imports: [BrowserModule, RouterModule.forRoot([])],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/222
describe('issue-222:APP_INITIALIZER:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('correctly handles APP_INITIALIZER in a mock module', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      '<router-outlet></router-outlet>',
    );
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/222
describe('issue-222:APP_INITIALIZER:keep', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(TargetModule)
      .mock(APP_BASE_HREF, ''),
  );

  it('correctly handles APP_INITIALIZER in a kept module', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      '<router-outlet></router-outlet>',
    );
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/222
describe('issue-222:APP_INITIALIZER:guts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule(
      ngMocks.guts(TargetComponent, TargetModule),
    ).compileComponents(),
  );

  it('correctly handles APP_INITIALIZER in a kept module', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      '<router-outlet></router-outlet>',
    );
  });
});

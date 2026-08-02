import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

@NgModule({
  imports: [CommonModule],
  exports: [CommonModule],
})
class Issue7490Level4Module {}

@NgModule({
  imports: [Issue7490Level4Module],
  exports: [Issue7490Level4Module],
})
class Issue7490Level3Module {}

@NgModule({
  imports: [Issue7490Level3Module],
  exports: [Issue7490Level3Module],
})
class Issue7490Level2Module {}

@NgModule({
  imports: [Issue7490Level2Module],
  exports: [Issue7490Level2Module],
})
class Issue7490Level1Module {}

@Component({
  selector: 'issue-7490-target',
  template: '<ng-container *ngIf="true">target</ng-container>',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    CommonModule,
    Issue7490Level1Module,
  ],
})
class Issue7490TargetComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/7490
// CommonModule is both a direct standalone import and a deep re-export.
// MockBuilder must configure the complete dependency graph before it follows
// export parents to select the TestBed root.
describe('issue-7490', () => {
  beforeEach(() => MockBuilder(Issue7490TargetComponent));

  it('builds a standalone target with deep CommonModule re-exports', () => {
    const fixture = TestBed.createComponent(Issue7490TargetComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toBe('target');
  });
});

import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatBadgeModule } from '@angular/material/badge';
import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
} from 'ng-mocks';

@Component({
  selector: 'target',
  template: '<label [matBadge]="777">My Label</label>',
})
class TargetComponent {
  constructor(public readonly service: BreakpointObserver) {}
}

@NgModule({
  imports: [MatBadgeModule],
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4249
describe('issue-4249', () => {
  describe('MockBuilder', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule)
        .keep(MatBadgeModule)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('creates TargetComponent', () => {
      expect(() => MockRender(TargetComponent)).not.toThrow();
    });
  });

  describe('TestBed', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [MatBadgeModule],
        declarations: [TargetComponent],
      }).compileComponents(),
    );

    it('creates TargetComponent', () => {
      expect(() => MockRender(TargetComponent)).not.toThrow();
    });
  });
});

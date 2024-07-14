import { CommonModule } from '@angular/common';
import { Component, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'my-test-one',
  template: `<a [routerLink]="['test']">Test</a>`,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    CommonModule,
    RouterModule,
  ],
})
class TestOneComponent {}

@Component({
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
  ['imports' as never /* TODO: remove after upgrade to a14 */]: [
    CommonModule,
    RouterModule,
  ],
  template: `<a [routerLink]="['test']">Test</a>`,
})
class TestTwoComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4032
describe('issue-4032', () => {
  if (Number.parseInt(VERSION.major, 10) < 14) {
    it('needs >=a14', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  ngMocks.throwOnConsole();

  describe('w/ selector', () => {
    beforeEach(() => MockBuilder(TestOneComponent));

    it('should render w/ MockRender', () => {
      expect(
        MockRender(TestOneComponent).point.componentInstance,
      ).toBeDefined();
    });

    it('should render w/ TestBed', () => {
      const fixture = TestBed.createComponent(TestOneComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeDefined();
    });
  });

  describe('w/o selector', () => {
    beforeEach(() => MockBuilder(TestTwoComponent));

    it('should render w/ MockRender', () => {
      expect(
        MockRender(TestTwoComponent).point.componentInstance,
      ).toBeDefined();
    });

    it('should render w/ TestBed', () => {
      const fixture = TestBed.createComponent(TestTwoComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeDefined();
    });
  });
});

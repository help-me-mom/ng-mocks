import { Component, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockInstance,
  MockProvider,
  MockRender,
} from 'ng-mocks';

@Injectable()
class TargetService {
  public method1() {
    return `${this.constructor.name}:method1:real`;
  }

  public method2() {
    return `${this.constructor.name}:method2:real`;
  }
}

@Component({
  selector: 'target',
  template: '',
})
class TargetComponent {
  constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  providers: [TargetService],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4367
describe('issue-4367', () => {
  describe('MockProvider', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
        providers: [
          MockProvider(TargetService, {
            method1: () => 'mock',
            method2: undefined, // <- should be default spy
          }),
        ],
      }),
    );

    it('overrides method1 only', () => {
      const fixture = MockRender(TargetComponent);

      // method2 should be default mock
      expect(
        fixture.point.componentInstance.service.method1,
      ).toBeDefined();
      expect(
        fixture.point.componentInstance.service.method2,
      ).toBeDefined();
    });
  });

  describe('MockBuilder', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(TargetService, {
        method1: () => 'mock',
        method2: undefined, // <- should be default spy
      }),
    );

    it('overrides method1 only', () => {
      const fixture = MockRender(TargetComponent);

      // method2 should be default mock
      expect(
        fixture.point.componentInstance.service.method1,
      ).toBeDefined();
      expect(
        fixture.point.componentInstance.service.method2,
      ).toBeDefined();
    });
  });

  describe('MockInstance', () => {
    MockInstance.scope();
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
        providers: [MockProvider(TargetService)],
      }),
    );

    it('overrides method1 only', () => {
      MockInstance(TargetService, () => ({
        method1: () => 'mock',
        method2: undefined, // <- should be default spy
      }));
      const fixture = MockRender(TargetComponent);

      // method2 should be default mock
      expect(
        fixture.point.componentInstance.service.method1,
      ).toBeDefined();
      expect(
        fixture.point.componentInstance.service.method2,
      ).toBeDefined();
    });

    it('overrides method1 and method2', () => {
      MockInstance(TargetService, 'method1', () => 'mock');
      MockInstance(TargetService, 'method2', undefined as never); // <- breaks the things
      const fixture = MockRender(TargetComponent);

      // method2 should be undefined
      expect(
        fixture.point.componentInstance.service.method1,
      ).toBeDefined();
      expect(
        fixture.point.componentInstance.service.method2,
      ).not.toBeDefined();
    });
  });
});

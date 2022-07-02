import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly name?: string = 'target';
}

@NgModule()
class TargetModule {
  public static forRoot() {
    return {
      ngModule: TargetModule,
      providers: [TargetService],
    };
  }
}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

// @see https://github.com/help-me-mom/ng-mocks/issues/762
describe('issue-762:module', () => {
  describe('as keep single', () => {
    beforeEach(() => MockBuilder(TargetModule.forRoot()));

    it('works correctly', () => {
      const fixture = MockRender(TargetService);
      expect(fixture.point.componentInstance).toEqual(
        assertion.any(TargetService),
      );
      expect(fixture.point.componentInstance.name).toEqual('target');
    });
  });

  describe('as keep multi', () => {
    beforeEach(() => MockBuilder([TargetModule.forRoot()]));

    it('works correctly', () => {
      const fixture = MockRender(TargetService);
      expect(fixture.point.componentInstance).toEqual(
        assertion.any(TargetService),
      );
      expect(fixture.point.componentInstance.name).toEqual('target');
    });
  });

  describe('as mock single', () => {
    beforeEach(() => MockBuilder(null, TargetModule.forRoot()));

    it('works correctly', () => {
      const fixture = MockRender(TargetService);
      expect(fixture.point.componentInstance).toEqual(
        assertion.any(TargetService),
      );
      expect(fixture.point.componentInstance.name).toEqual(undefined);
    });
  });

  describe('as mock multi', () => {
    beforeEach(() => MockBuilder(null, [TargetModule.forRoot()]));

    it('works correctly', () => {
      const fixture = MockRender(TargetService);
      expect(fixture.point.componentInstance).toEqual(
        assertion.any(TargetService),
      );
      expect(fixture.point.componentInstance.name).toEqual(undefined);
    });
  });
});

import { Injectable, NgModule } from '@angular/core';
import {
  MockBuilder,
  MockRender,
  NgModuleWithProviders,
} from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly name?: string = 'target';
}

@NgModule()
class TargetModule {
  public static forRoot(): NgModuleWithProviders<TargetModule> {
    return {
      ngModule: TargetModule,
      providers: [TargetService],
    };
  }
}

describe('issue-762:module', () => {
  describe('as keep single', () => {
    beforeEach(() => MockBuilder(TargetModule.forRoot()));

    it('works correctly', () => {
      const fixture = MockRender(TargetService);
      expect(fixture.point.componentInstance).toEqual(
        jasmine.any(TargetService),
      );
      expect(fixture.point.componentInstance.name).toEqual('target');
    });
  });

  describe('as keep multi', () => {
    beforeEach(() => MockBuilder([TargetModule.forRoot()]));

    it('works correctly', () => {
      const fixture = MockRender(TargetService);
      expect(fixture.point.componentInstance).toEqual(
        jasmine.any(TargetService),
      );
      expect(fixture.point.componentInstance.name).toEqual('target');
    });
  });

  describe('as mock single', () => {
    beforeEach(() => MockBuilder(null, TargetModule.forRoot()));

    it('works correctly', () => {
      const fixture = MockRender(TargetService);
      expect(fixture.point.componentInstance).toEqual(
        jasmine.any(TargetService),
      );
      expect(fixture.point.componentInstance.name).toEqual(undefined);
    });
  });

  describe('as mock multi', () => {
    beforeEach(() => MockBuilder(null, [TargetModule.forRoot()]));

    it('works correctly', () => {
      const fixture = MockRender(TargetService);
      expect(fixture.point.componentInstance).toEqual(
        jasmine.any(TargetService),
      );
      expect(fixture.point.componentInstance.name).toEqual(undefined);
    });
  });
});

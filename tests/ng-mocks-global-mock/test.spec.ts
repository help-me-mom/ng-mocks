import {
  Directive,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockBuilder,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@Injectable()
class TargetService {
  public readonly name = 'target';

  public constructor(@Inject(TOKEN) public token: string) {}
}

@Directive({
  selector: 'target-ng-mocks-global-mock',
})
class TargetDirective {
  public constructor(public readonly service: TargetService) {}
}

@Directive({
  selector: 'target-ng-mocks-global-mock',
})
class MockDirective {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetDirective, MockDirective],
  exports: [TargetDirective, MockDirective],
  providers: [
    TargetService,
    {
      provide: TOKEN,
      useValue: 'target',
    },
  ],
})
class TargetModule {}

@NgModule({
  exports: [TargetModule],
  imports: [TargetModule],
})
class EntryModule {}

ngMocks.globalKeep(TargetModule);
ngMocks.globalMock(TOKEN);
ngMocks.globalMock(MockDirective);
ngMocks.defaultMock(TOKEN, () => 'mock');

describe('ng-mocks-global-mock', () => {
  ngMocks.throwOnConsole();

  describe('MockModule', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [MockModule(EntryModule)],
      }),
    );

    it('get real service with a mock token', () => {
      MockRender(
        '<target-ng-mocks-global-mock></target-ng-mocks-global-mock>',
      );
      const dir1 = ngMocks.findInstance(TargetDirective);
      const dir2 = ngMocks.findInstance(MockDirective);

      expect(isMockOf(dir1, TargetDirective)).toEqual(false);
      expect(isMockOf(dir2, MockDirective)).toEqual(true);
      expect(dir1.service.name).toEqual('target');
      expect(dir1.service.token).toEqual('mock');
    });
  });

  describe('MockBuilder:default', () => {
    beforeEach(() => MockBuilder(null, EntryModule));

    it('get real service with a mock token', () => {
      MockRender(
        '<target-ng-mocks-global-mock></target-ng-mocks-global-mock>',
      );
      const dir1 = ngMocks.findInstance(TargetDirective);
      const dir2 = ngMocks.findInstance(MockDirective);

      expect(isMockOf(dir1, TargetDirective)).toEqual(false);
      expect(isMockOf(dir2, MockDirective)).toEqual(true);
      expect(dir1.service.name).toEqual('target');
      expect(dir1.service.token).toEqual('mock');
    });
  });

  describe('MockBuilder:exclude:token', () => {
    beforeEach(() => MockBuilder(null, EntryModule).exclude(TOKEN));

    it('switches to exclude', () => {
      expect(() =>
        MockRender(
          '<target-ng-mocks-global-mock></target-ng-mocks-global-mock>',
        ),
      ).toThrow();
    });
  });

  describe('MockBuilder:exclude:directive', () => {
    beforeEach(() =>
      MockBuilder(null, EntryModule).exclude(MockDirective),
    );

    it('switches to exclude', () => {
      MockRender(
        '<target-ng-mocks-global-mock></target-ng-mocks-global-mock>',
      );
      expect(() => ngMocks.findInstance(MockDirective)).toThrow();
    });
  });

  describe('MockBuilder:exclude:token', () => {
    beforeEach(() => MockBuilder(null, EntryModule).keep(TOKEN));

    it('switches to exclude', () => {
      MockRender(
        '<target-ng-mocks-global-mock></target-ng-mocks-global-mock>',
      );
      const dir1 = ngMocks.findInstance(TargetDirective);

      expect(dir1.service.token).toEqual('target');
    });
  });

  describe('MockBuilder:exclude:directive', () => {
    beforeEach(() =>
      MockBuilder(null, EntryModule).keep(MockDirective),
    );

    it('switches to exclude', () => {
      MockRender(
        '<target-ng-mocks-global-mock></target-ng-mocks-global-mock>',
      );
      const dir2 = ngMocks.findInstance(MockDirective);

      expect(isMockOf(dir2, MockDirective)).toEqual(false);
      expect(dir2.service.name).toEqual('target');
      expect(dir2.service.token).toEqual('mock');
    });
  });
});

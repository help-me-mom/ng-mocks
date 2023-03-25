import {
  Component,
  forwardRef,
  Inject,
  Injectable,
  NgModule,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-735-provider-for-module',
  template: '{{ service.name }}',
})
class TargetComponent {
  public constructor(
    @Inject(forwardRef(() => TargetService))
    public readonly service: any /* A6 type error */,
  ) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

const injectableTargetServiceArgs = [
  {
    providedIn: TargetModule,
  } as never,
];

@Injectable(...injectableTargetServiceArgs)
class TargetService {
  public readonly name: string = 'target';
}

@NgModule({})
class TargetUnusedModule {}

const injectableTargetUnusedService = [
  {
    providedIn: TargetUnusedModule,
  } as never,
];

@Injectable(...injectableTargetUnusedService)
class TargetUnusedService {
  public readonly name: string = 'unused';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/735
describe('issue-735:provider-for-module', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('unprovided', () => {
    beforeAll(() => ngMocks.globalMock(TargetService));
    beforeAll(() =>
      ngMocks.defaultMock(TargetService, () => ({
        name: 'mock1',
      })),
    );
    beforeAll(() => ngMocks.globalMock(TargetUnusedService));
    beforeAll(() =>
      ngMocks.defaultMock(TargetUnusedService, () => ({
        name: 'mock1',
      })),
    );

    afterAll(() => ngMocks.defaultMock(TargetUnusedService));
    afterAll(() => ngMocks.globalWipe(TargetUnusedService));
    afterAll(() => ngMocks.defaultMock(TargetService));
    afterAll(() => ngMocks.globalWipe(TargetService));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetModule));

      it('throws on unprovided global mock', () => {
        expect(() => MockRender(TargetUnusedService)).toThrowError(
          /No provider for TargetUnusedService/,
        );
      });
    });
  });

  describe('ngMocks.defaultMock', () => {
    beforeAll(() => ngMocks.globalMock(TargetService));
    beforeAll(() =>
      ngMocks.defaultMock(TargetService, () => ({
        name: 'mock1',
      })),
    );

    afterAll(() => ngMocks.defaultMock(TargetService));
    afterAll(() => ngMocks.globalWipe(TargetService));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetModule));

      it('uses default mock correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.service.name).toEqual('mock1');
      });
    });

    describe('TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          imports: [TargetModule],
        }).compileComponents(),
      );

      it('uses default mock correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.service.name).toEqual('mock1');
      });
    });
  });

  describe('ngMocks.defaultKeep', () => {
    beforeAll(() => ngMocks.globalKeep(TargetService));
    beforeAll(() =>
      ngMocks.defaultMock(TargetService, () => ({
        name: 'mock2',
      })),
    );

    afterAll(() => ngMocks.defaultMock(TargetService));
    afterAll(() => ngMocks.globalWipe(TargetService));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetModule));

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.service.name).toEqual(
          'target',
        );
      });
    });

    describe('MockBuilder:mock', () => {
      beforeEach(() =>
        MockBuilder(TargetModule).mock(TargetService, {
          name: 'mock3',
        }),
      );

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.service.name).toEqual('mock3');
      });
    });

    describe('TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          imports: [TargetModule],
        }).compileComponents(),
      );

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.service.name).toEqual(
          'target',
        );
      });
    });
  });
});

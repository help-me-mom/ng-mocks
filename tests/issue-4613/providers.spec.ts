import { Component, Injectable, NgModule } from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
class ProviderService {}

@Injectable()
class Provider1Service {}

@Injectable()
class Provider2Service {}

@Component({
  selector: 'target-4613-providers',
  template: '{{ service.constructor.name }}',
  providers: [Provider2Service],
})
class TargetComponent {
  constructor(public readonly service: ProviderService) {}
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {
  static for1() {
    return {
      ngModule: TargetModule,
      providers: [
        Provider1Service,
        {
          provide: ProviderService,
          useExisting: Provider1Service,
        },
      ],
    };
  }

  static for2() {
    return {
      ngModule: TargetModule,
      providers: [
        Provider2Service,
        {
          provide: ProviderService,
          useExisting: Provider2Service,
        },
      ],
    };
  }
}

@NgModule({
  imports: [TargetModule],
})
class DependencyModule {}

@NgModule({
  imports: [TargetModule.for2()],
})
class DependencyWithProvidersModule {}

@NgModule({
  providers: [ProviderService],
})
class ProviderModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4613
describe('issue-4613', () => {
  describe('fails without providers', () => {
    beforeEach(() => MockBuilder(TargetComponent, DependencyModule));

    it('fails because no provider for ProviderService', () => {
      expect(() => MockRender(TargetComponent)).toThrowError(
        /No provider for ProviderService/,
      );
    });
  });

  describe('works with providers', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, [
        DependencyModule,
        ProviderModule,
      ]),
    );

    it('renders ProviderService', () => {
      expect(ngMocks.formatText(MockRender(TargetComponent))).toEqual(
        'ProviderService',
      );
    });
  });

  describe('MockBuilder.mock', () => {
    describe('works with nested Provider1Service', () => {
      beforeEach(() =>
        MockBuilder(
          [TargetComponent, ProviderService],
          [DependencyModule, TargetModule.for1()],
        ),
      );

      it('renders Provider1Service', () => {
        expect(
          ngMocks.formatText(MockRender(TargetComponent)),
        ).toEqual('Provider1Service');

        expect(
          isMockOf(
            ngMocks.findInstance(ProviderService),
            Provider1Service,
          ),
        ).toEqual(true);
      });
    });

    describe('overrides Provider2Service with Provider1Service', () => {
      beforeEach(() =>
        MockBuilder(
          [TargetComponent, ProviderService],
          [DependencyWithProvidersModule, TargetModule.for1()],
        ),
      );

      it('renders Provider1Service', () => {
        expect(
          ngMocks.formatText(MockRender(TargetComponent)),
        ).toEqual('Provider1Service');

        expect(
          isMockOf(
            ngMocks.findInstance(ProviderService),
            Provider1Service,
          ),
        ).toEqual(true);
      });
    });
  });

  describe('MockBuilder.keep', () => {
    describe('works with nested Provider1Service', () => {
      beforeEach(() =>
        MockBuilder([
          TargetComponent,
          DependencyModule,
          TargetModule.for1(),
        ]),
      );

      it('renders Provider1Service', () => {
        expect(
          ngMocks.formatText(MockRender(TargetComponent)),
        ).toEqual('Provider1Service');

        expect(
          isMockOf(
            ngMocks.findInstance(ProviderService),
            Provider1Service,
          ),
        ).toEqual(false);
      });
    });

    describe('overrides Provider2Service with Provider1Service', () => {
      beforeEach(() =>
        MockBuilder([
          TargetComponent,
          DependencyWithProvidersModule,
          TargetModule.for1(),
        ]),
      );

      it('renders Provider1Service', () => {
        expect(
          ngMocks.formatText(MockRender(TargetComponent)),
        ).toEqual('Provider1Service');

        expect(
          isMockOf(
            ngMocks.findInstance(ProviderService),
            Provider1Service,
          ),
        ).toEqual(false);
      });
    });
  });
});

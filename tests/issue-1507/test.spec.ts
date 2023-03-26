import { Component, Injectable, Input } from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockProvider,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class ProviderService {
  public description = 'real provider';
}

@Injectable()
class ViewProviderService {
  public description = 'real viewProvider';
}

@Component({
  providers: [ProviderService],
  selector: 'hello',
  template: `
    <h1 class="name">{{ name }}</h1>
    <div class="provider">{{ provider.description }}</div>
    <div class="viewProvider">{{ viewProvider.description }}</div>
  `,
  viewProviders: [ViewProviderService],
})
class HelloComponent {
  @Input() public readonly name: string | null = null;

  public constructor(
    public readonly provider: ProviderService,
    public readonly viewProvider: ViewProviderService,
  ) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/1507
// Difference between MockBuilder.provide and MockBuilder.mock
// Only MockBuilder.mock replaces providers on the component / directive level.
// MockBuilder.provide simply adds a service to global scope.
describe('issue-1507', () => {
  MockInstance.scope();

  describe('default', () => {
    beforeEach(() => MockBuilder(HelloComponent));

    it('keeps providers and viewProviders as they are', () => {
      MockRender(HelloComponent, { name: 'Test1' });

      const name = ngMocks.formatText(ngMocks.find('.name'));
      expect(name).toEqual('Test1');

      const provider = ngMocks.formatText(ngMocks.find('.provider'));
      expect(provider).toEqual('real provider');

      const viewProvider = ngMocks.formatText(
        ngMocks.find('.viewProvider'),
      );
      expect(viewProvider).toEqual('real viewProvider');
    });
  });

  describe('.keep', () => {
    beforeEach(() =>
      MockBuilder(HelloComponent)
        .keep(ProviderService)
        .keep(ViewProviderService),
    );

    it('keeps providers and viewProviders as they are', () => {
      MockRender(HelloComponent, { name: 'Test2' });

      const name = ngMocks.formatText(ngMocks.find('.name'));
      expect(name).toEqual('Test2');

      const provider = ngMocks.formatText(ngMocks.find('.provider'));
      expect(provider).toEqual('real provider');

      const viewProvider = ngMocks.formatText(
        ngMocks.find('.viewProvider'),
      );
      expect(viewProvider).toEqual('real viewProvider');
    });
  });

  describe('.provide', () => {
    beforeEach(() =>
      MockBuilder(HelloComponent)
        .provide(
          MockProvider(ProviderService, {
            description: 'provided provider',
          }),
        )
        .provide(
          MockProvider(ViewProviderService, {
            description: 'provided viewProvider',
          }),
        ),
    );

    it('provides mocks on the root level', () => {
      MockRender(HelloComponent, { name: 'Test3' });

      const name = ngMocks.formatText(ngMocks.find('.name'));
      expect(name).toEqual('Test3');

      const provider = ngMocks.formatText(ngMocks.find('.provider'));
      expect(provider).toEqual('real provider');
      expect(
        ngMocks.findInstance(ProviderService).description,
      ).toEqual('provided provider');

      const viewProvider = ngMocks.formatText(
        ngMocks.find('.viewProvider'),
      );
      expect(viewProvider).toEqual('real viewProvider');
      expect(
        ngMocks.findInstance(ViewProviderService).description,
      ).toEqual('provided viewProvider');
    });
  });

  describe('.mock', () => {
    beforeEach(() =>
      MockBuilder(HelloComponent)
        .mock(ProviderService, {
          description: 'mock provider',
        })
        .mock(ViewProviderService, {
          description: 'mock viewProvider',
        }),
    );

    it('mocks services on the component level', () => {
      MockRender(HelloComponent, { name: 'Test4' });

      const name = ngMocks.formatText(ngMocks.find('.name'));
      expect(name).toEqual('Test4');

      const provider = ngMocks.formatText(ngMocks.find('.provider'));
      expect(provider).toEqual('mock provider');

      const viewProvider = ngMocks.formatText(
        ngMocks.find('.viewProvider'),
      );
      expect(viewProvider).toEqual('mock viewProvider');
    });
  });
});

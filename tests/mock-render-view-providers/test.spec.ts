import { Component, Injectable } from '@angular/core';

import { MockBuilder, MockProvider, MockRender } from 'ng-mocks';

@Injectable()
class TargetService {
  public name = 'real';
}

@Component({
  selector: 'target-mock-render-view-providers',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template: '{{ service.name }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

describe('MockRender.viewProviders', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('throws without the service', () => {
    expect(() => MockRender(TargetComponent)).toThrowError(
      new RegExp(`No provider for ${TargetService.name}`),
    );
  });

  it('providers services via viewProviders', () => {
    expect(() =>
      MockRender(TargetComponent, null, {
        viewProviders: [
          MockProvider(TargetService, {
            name: 'mock',
          }),
        ],
      }),
    ).not.toThrow();
  });
});

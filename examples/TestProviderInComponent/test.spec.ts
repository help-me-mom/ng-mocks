import { Component, Injectable } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly value = 'target';
}

@Component({
  providers: [TargetService],
  selector: 'target',
  template: `{{ service.value }}`,
})
class TargetComponent {
  public readonly service: TargetService;

  constructor(service: TargetService) {
    this.service = service;
  }
}

describe('TestProviderInComponent', () => {
  beforeEach(() => MockBuilder(TargetService, TargetComponent));

  it('has access to the service via a component', () => {
    const fixture = MockRender(TargetComponent);

    // despite the mocked component we have access to the original service.
    const service = fixture.point.injector.get(TargetService);
    expect(service.value).toEqual('target');
  });
});

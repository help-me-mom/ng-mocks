import { Component, Injectable } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

// A simple service, might have contained more logic,
// but it is redundant for the test demonstration.
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
  // Because we want to test the service, we pass it as the first
  // argument of MockBuilder.
  // Because we do not care about TargetComponent, we pass it as
  // the second argument for being mocked.
  beforeEach(() => MockBuilder(TargetService, TargetComponent));

  it('has access to the service via a component', () => {
    // Let's render the mocked component. It provides a point
    // to access the service.
    const fixture = MockRender(TargetComponent);

    // The root element is fixture.point and it is the TargetComponent
    // with its injector for extracting internal services.
    const service = fixture.point.injector.get(TargetService);

    // Here we go, now we can assert everything about the service.
    expect(service.value).toEqual('target');
  });
});

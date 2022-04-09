import { Injectable, NgModule } from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

// Dependency 1.
@Injectable()
class Service1 {
  public name = 'target';
}

// A service we want to use.
@Injectable()
class TargetService {
  public constructor(public readonly service: Service1) {}
}

// A module that provides all services.
@NgModule({
  providers: [
    Service1,
    {
      deps: [Service1],
      provide: TargetService,
      useFactory: (service: Service1) => new TargetService(service),
    },
  ],
})
class TargetModule {}

describe('TestProviderWithUseFactory', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its initialization
  // we need to pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetModule));

  beforeAll(() => {
    // Let's customize a bit behavior of the mock copy of Service1.
    MockInstance(Service1, {
      init: instance => {
        instance.name = 'mock1';
      },
    });
  });

  // Resets customizations from MockInstance.
  afterAll(MockReset);

  it('creates TargetService', () => {
    const service = MockRender(TargetService).point.componentInstance;

    // Because Service1 has been replaced with a mock copy, we should get mock1 here.
    expect(service.service.name).toEqual('mock1');
  });
});

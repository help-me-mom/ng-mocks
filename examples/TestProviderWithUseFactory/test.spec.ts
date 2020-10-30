import { Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockInstance } from 'ng-mocks';

// Dependency 1.
@Injectable()
class Service1 {
  public name = 'target';
}

// A service we want to use.
@Injectable()
class TargetService {
  public readonly service: Service1;

  constructor(service: Service1) {
    this.service = service;
  }
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
  beforeEach(() => MockBuilder(TargetService, TargetModule));

  beforeAll(() => {
    // Let's customize a bit behavior of the mocked copy of Service1.
    MockInstance(Service1, {
      init: instance => {
        instance.name = 'mock1';
      },
    });
  });

  it('creates TargetService', () => {
    const service = TestBed.get(TargetService);

    // Because Service1 has been mocked, we should get mock1 here.
    expect(service.service.name).toEqual('mock1');
  });
});

import { Injectable, NgModule } from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

// A service we want to use.
@Injectable()
class Service1 {
  public name = 'target';
}

// A service we want to replace.
@Injectable()
class Service2 {
  public name = 'target';
}

// A service we want to test and to replace via useExisting.
@Injectable()
class TargetService {}

// A module that provides all services.
@NgModule({
  providers: [
    Service1,
    {
      provide: Service2,
      useExisting: Service1,
    },
    {
      provide: TargetService,
      useExisting: Service2,
    },
  ],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('TestProviderWithUseExisting', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its initialization
  // we need to pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetModule));

  beforeAll(() => {
    // Let's customize a bit behavior of the mock copy of Service1.
    MockInstance(Service2, {
      init: instance => {
        instance.name = 'mock2';
      },
    });
  });

  // Resets customizations from MockInstance.
  afterAll(MockReset);

  it('creates TargetService', () => {
    const service = MockRender<
      TargetService & Partial<{ name: string }>
    >(TargetService).point.componentInstance;

    // Because Service2 has been replaced with a mock copy,
    // we are getting here a mock copy of Service2 instead of Service1.
    expect(service).toEqual(assertion.any(Service2));
    // Because we have kept TargetService we are getting here a
    // mock copy of Service2 as it says in useExisting.
    expect(service.name).toEqual('mock2');
  });
});

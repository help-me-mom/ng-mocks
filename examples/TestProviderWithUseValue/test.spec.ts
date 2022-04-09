import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

// A simple service, it might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly name = 'target';
}

// A module that provides all services.
@NgModule({
  providers: [
    {
      provide: TargetService,
      // an empty object instead
      useValue: {
        service: null,
      },
    },
  ],
})
class TargetModule {}

describe('TestProviderWithUseValue', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its initialization
  // we need to pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetModule));

  it('creates TargetService', () => {
    const service =
      MockRender<TargetService>(TargetService).point
        .componentInstance;

    // Let's assert received data.
    expect(service as any).toEqual({
      service: null,
    });
  });
});

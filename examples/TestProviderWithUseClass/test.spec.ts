import { Injectable, NgModule } from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

// A service we want to replace via useClass.
@Injectable()
class Service1 {
  public constructor(public name: string) {}
}

// A service replacing the Service1.
@Injectable()
class Service2 extends Service1 {
  public readonly flag = true;
}

// A service we want to test and to replace via useClass.
@Injectable()
class Target1Service {
  public constructor(public readonly service: Service1) {}
}

// A service replacing the Target1Service.
@Injectable()
class Target2Service extends Target1Service {
  public readonly flag = true;
}

// A module that provides all services.
@NgModule({
  providers: [
    {
      provide: 'real',
      useValue: 'real',
    },
    {
      deps: ['real'],
      provide: Service1,
      useClass: Service2,
    },
    {
      deps: [Service1],
      provide: Target1Service,
      useClass: Target2Service,
    },
  ],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('TestProviderWithUseClass', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its dependencies
  // we need to pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(Target1Service, TargetModule));

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

  it('respects all dependencies', () => {
    const service = MockRender<
      Target1Service & Partial<Target2Service>
    >(Target1Service).point.componentInstance;

    // Let's assert that service has a flag from Target2Service.
    expect(service.flag).toBeTruthy();
    expect(service).toEqual(assertion.any(Target2Service));

    // And let's assert that Service1 has been replaced with its mock copy
    // and its name is undefined.
    expect(service.service.name).toEqual('mock1');
    expect(service.service).toEqual(assertion.any(Service1));

    // Because we use a mock module, Service1 has been replaced with
    // a mock copy based on its `provide` class, deps and other
    // values are ignored by building mocks logic.
    expect(service.service).not.toEqual(assertion.any(Service2));
  });
});

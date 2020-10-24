import { Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockInstance, MockReset } from 'ng-mocks';

// A service we want to replace via useClass.
@Injectable()
class Service1 {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}

// A service replacing the Service1.
@Injectable()
class Service2 extends Service1 {
  public readonly flag = true;
}

// A service we want to test and to replace via useClass.
@Injectable()
class Target1Service {
  public readonly service: Service1;

  constructor(service: Service1) {
    this.service = service;
  }
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

describe('TestProviderWithUseClass', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its dependencies
  // we need to pass its module as the second parameter.
  beforeEach(() => MockBuilder(Target1Service, TargetModule));

  beforeAll(() => {
    // Let's customize a bit behavior of the mocked copy of Service1.
    MockInstance(Service1, {
      init: instance => {
        instance.name = 'mock1';
      },
    });
  });

  afterAll(MockReset);

  it('respects all dependencies', () => {
    const service = TestBed.get(Target1Service);

    // Let's assert that service has a flag from Target2Service.
    expect(service.flag).toBeTruthy();
    expect(service).toEqual(jasmine.any(Target2Service));

    // And let's assert that Service1 has been mocked and its name
    // is undefined.
    expect(service.service.name).toEqual('mock1');
    expect(service.service).toEqual(jasmine.any(Service1));

    // Because we mocked the module, Service1 has been mocked
    // based on its `provide` class, deps and other values are
    // ignored by mocking logic.
    expect(service.service).not.toEqual(jasmine.any(Service2));
  });
});

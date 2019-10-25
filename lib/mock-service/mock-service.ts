import { Injectable, Type, ValueProvider } from '@angular/core';
import { MockOf } from '../common';

function getErrorMessage(className: string): string {
  return `
    Failed to mock ${className}.
    Perhaps it requires injected dependencies in the constructor.
    Try providing them in MockService(YourService, [deps])`;
}

export function MockService<TService>(service: Type<TService>, deps: any[] = []): ValueProvider {
  return {provide: service, useValue: MockedServiceInstance<TService>(service, deps)};
}

export function MockedServiceInstance<TService = any>(service: Type<TService>, deps: any[] = []): TService {
  @MockOf(service)
  class ServiceMock extends (service as any) {
    constructor() {
      try {
        super(...deps);
      } catch ({name, stack, message}) {
        message = `${getErrorMessage(service.name)}\n\n${message}}`;
        throw  {name, message, stack};
      }
    }
  }

  // tslint:disable-next-line:no-angle-bracket-type-assertion
  const mockedService = Injectable()(<any> ServiceMock as Type<TService>);
  return new mockedService();
}

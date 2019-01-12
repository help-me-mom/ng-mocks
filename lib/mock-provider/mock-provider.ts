import { Type } from '@angular/core';
import { MockOf } from '../common';

const cache = new Map<Type<object>, Type<object>>();

export interface IProvider<TService extends object> {
  provide: Type<TService>;
  useClass: Type<TService>;
}

export function MockProviders(
  ...services: Array<Type<object>>
): Array<IProvider<object>> {
  return services.map((service) => MockProvider(service, undefined));
}

export function MockProvider<TService extends object>(
  service: Type<TService>,
  methodsFactory?: (methodName: string) => any
): IProvider<TService> {
  const cacheHit = cache.get(service);
  if (cacheHit) {
    return {
      provide: service,
      useClass: cacheHit as Type<TService>
    };
  }

  // tslint:disable:no-unnecessary-class
  @MockOf(service)
  class ServiceMock {
    constructor() {
      Object.keys(service.prototype).forEach((method) => {
        if (!(this as any)[method]) {
          (this as any)[method] = methodsFactory ? methodsFactory(method) : () => {};
        }
      });
    }
  }

  const mockedService = ServiceMock as Type<TService>;
  cache.set(service, mockedService);

  return {
    provide: service,
    useClass: mockedService
  };
}

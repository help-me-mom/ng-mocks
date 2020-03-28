export type MockedFunction = () => undefined;

/**
 * @internal
 */
export const mockServiceHelper = {
  mockFunction: (object?: {}, method?: string): MockedFunction => () => undefined,

  createMockFromPrototype: (service: any): {[key: string]: MockedFunction} => {
    const methods = mockServiceHelper.extractMethodsFromPrototype(service);
    const value: {[key: string]: MockedFunction} = {};
    for (const method of methods) {
      value[method] = mockServiceHelper.mockFunction(value, method);
    }
    return value;
  },

  extractMethodsFromPrototype: (service: any): string[] => {
    const result: string[] = [];
    let prototype = service;
    while (prototype && Object.getPrototypeOf(prototype) !== null) {
      for (const method of Object.getOwnPropertyNames(prototype)) {
        if (method === 'constructor') {
          continue;
        }

        const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
        const isGetterSetter = descriptor && (descriptor.get || descriptor.set);
        if (!isGetterSetter && result.indexOf(method) === -1) {
          result.push(method);
        }
      }
      prototype = Object.getPrototypeOf(prototype);
    }
    return result;
  }
};

export function MockService(service: boolean | number | string | null | undefined): undefined;
export function MockService<T extends {}>(service: T): any;
export function MockService(service: any): any {
  // mocking all methods / properties of a class / object.
  let value: any;
  if (typeof service === 'function' && service.prototype) {
    value = mockServiceHelper.createMockFromPrototype(service.prototype);
  } else if (typeof service === 'function') {
    value = mockServiceHelper.mockFunction();
  } else if (Array.isArray(service)) {
    value = [];
  } else if (typeof service === 'object' && service !== null && service.ngMetadataName !== 'InjectionToken') {
    value = typeof service.constructor === 'function' && service.constructor.prototype
      ? mockServiceHelper.createMockFromPrototype(service.constructor.prototype)
      : {};
    for (const property of Object.keys(service)) {
      const mock = MockService(service[property]);
      if (mock !== undefined) {
        value[property] = mock;
      }
    }
  }

  return value;
}

function MockClass(service: any): any {
  const value: any = {};
  let prototype = service;
  while (Object.getPrototypeOf(prototype) !== null) {
    for (const method of Object.getOwnPropertyNames(prototype)) {
      if (method === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
      const isGetterSetter = descriptor && (descriptor.get || descriptor.set);
      if (!isGetterSetter && !value[method]) {
        value[method] = () => undefined;
      }
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return value;
}

export function MockService(service: boolean | number | string | null | undefined): undefined;
export function MockService<T extends {}>(service: T): any;
export function MockService(service: any): any {
  // mocking all methods / properties of a class / object.
  let value: any;
  if (typeof service === 'function' && service.prototype) {
    value = MockClass(service.prototype);
  } else if (typeof service === 'function') {
    value = () => undefined;
  } else if (Array.isArray(service)) {
    value = [];
  } else if (typeof service === 'object' && service !== null && service.ngMetadataName !== 'InjectionToken') {
    value = typeof service.constructor === 'function' && service.constructor.prototype
      ? MockClass(service.constructor.prototype)
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

export type MockedFunction = () => undefined;

const isFunc = (value: any): boolean => {
  if (typeof value !== 'function') {
    return false;
  }
  const proto = value.toString();
  if (proto.match(/^\(/) !== null) {
    return true;
  }
  return proto.match(/^function\s*\(/) !== null;
};

const isClass = (value: any): boolean => {
  if (typeof value !== 'function') {
    return false;
  }
  if (isFunc(value)) {
    return false;
  }
  const proto = value.toString();
  if (proto.match(/^class\b/) !== null) {
    return true;
  }
  return proto.match(/^function\s*\(/) === null;
};

const isInst = (value: any): boolean => {
  if (value === null) {
    return false;
  }
  if (typeof value !== 'object') {
    return false;
  }
  if (value.ngMetadataName === 'InjectionToken') {
    return false;
  }
  return typeof value.__proto__ === 'object';
};

let customMockFunction: ((mockName: string) => MockedFunction) | undefined;

const mockServiceHelperPrototype = {
  mockFunction: (mockName: string): MockedFunction => {
    if (customMockFunction) {
      return customMockFunction(mockName);
    }
    return () => undefined;
  },

  registerMockFunction: (mockFunction: typeof customMockFunction) => {
    customMockFunction = mockFunction;
  },

  createMockFromPrototype: (service: any): { [key in keyof any]: MockedFunction } => {
    const methods = mockServiceHelperPrototype.extractMethodsFromPrototype(service);
    const value: any = {};
    for (const method of methods) {
      if (value[method]) {
        continue;
      }
      const mockName = `${service.constructor ? service.constructor.name : 'unknown'}.${method as any}`;
      value[method] = mockServiceHelperPrototype.mockFunction(mockName);
    }
    if (typeof value === 'object') {
      value.__proto__ = service;
    }

    return value;
  },

  extractMethodsFromPrototype: <T>(service: T): Array<keyof T> => {
    const result: Array<keyof T> = [];
    let prototype = service;
    while (prototype && Object.getPrototypeOf(prototype) !== null) {
      for (const method of Object.getOwnPropertyNames(prototype) as Array<keyof T>) {
        if ((method as any) === 'constructor') {
          continue;
        }

        const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
        const isGetterSetter = descriptor && (descriptor.get || descriptor.set);
        if (isGetterSetter || result.indexOf(method) !== -1) {
          continue;
        }
        result.push(method);
      }
      prototype = Object.getPrototypeOf(prototype);
    }
    return result;
  },

  mock: <T = MockedFunction>(instance: any, name: string, style?: 'get' | 'set'): T => {
    const def = Object.getOwnPropertyDescriptor(instance, name);
    if (def && def[style || 'value']) {
      return def[style || 'value'];
    }

    const mockName = `${typeof instance.prototype === 'function' ? instance.prototype.name : 'unknown'}.${name}${
      style ? `:${style}` : ''
    }`;
    const mock: any = mockServiceHelperPrototype.mockFunction(mockName);
    Object.defineProperty(instance, name, {
      [style || 'value']: mock,
    });
    return mock;
  },
};

// We need a single pointer to the object among all environments.
((window as any) || (global as any)).ngMocksMockServiceHelper =
  ((window as any) || (global as any)).ngMocksMockServiceHelper || mockServiceHelperPrototype;

const localHelper: typeof mockServiceHelperPrototype = ((window as any) || (global as any)).ngMocksMockServiceHelper;

/**
 * DO NOT USE this object outside of the library.
 * It can be changed any time without a notice.
 *
 * @internal
 */
export const mockServiceHelper: {
  extractMethodsFromPrototype(service: any): Array<keyof any>;
  mock<T = MockedFunction>(instance: any, name: string, style?: 'get' | 'set'): T;
  mockFunction(): MockedFunction;
  registerMockFunction(mockFunction: (mockName: string) => MockedFunction | undefined): void;
} = ((window as any) || (global as any)).ngMocksMockServiceHelper;

export function MockService(service?: boolean | number | string | null, mockNamePrefix?: string): undefined;
export function MockService<T extends {}>(service: T, mockNamePrefix?: string): any;
export function MockService(service: any, mockNamePrefix?: string): any {
  // mocking all methods / properties of a class / object.
  let value: any;
  if (isClass(service)) {
    value = localHelper.createMockFromPrototype(service.prototype);
  } else if (isFunc(service)) {
    value = localHelper.mockFunction(`func:${mockNamePrefix ? mockNamePrefix : service.name || 'arrow-function'}`);
  } else if (Array.isArray(service)) {
    value = [];
  } else if (isInst(service)) {
    value =
      typeof service.constructor === 'function'
        ? localHelper.createMockFromPrototype(service.constructor.prototype)
        : {};
    for (const property of Object.keys(service)) {
      const mock = MockService(service[property], `${mockNamePrefix ? mockNamePrefix : 'instance'}.${property}`);
      if (mock !== undefined) {
        value[property] = mock;
      }
    }
    value.__proto__ = service.__proto__;
  }

  return value;
}

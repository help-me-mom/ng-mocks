import { ngMocksUniverse } from '../common/ng-mocks-universe';

export type MockedFunction = () => any;

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
  return typeof Object.getPrototypeOf(value) === 'object';
};

let customMockFunction: ((mockName: string) => MockedFunction) | undefined;

const mockServiceHelperPrototype = {
  mockFunction: (mockName: string, original: boolean = false): MockedFunction => {
    if (customMockFunction && !original) {
      return customMockFunction(mockName);
    }

    // magic to make getters / setters working

    let value: any;
    let setValue: any;

    const func: any = (val: any) => {
      if (setValue) {
        setValue(val);
      }
      return value;
    };
    func.__ngMocks = true;
    func.__ngMocksSet = (newSetValue: any) => (setValue = newSetValue);
    func.__ngMocksGet = (newValue: any) => (value = newValue);

    return func;
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
    if (typeof value === 'object' && typeof service === 'object') {
      Object.setPrototypeOf(value, service);
    }

    return value;
  },

  extractMethodsFromPrototype: <T>(service: T): string[] => {
    const result: string[] = [];
    let prototype = service;
    while (prototype && Object.getPrototypeOf(prototype) !== null) {
      for (const method of Object.getOwnPropertyNames(prototype)) {
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

  extractPropertiesFromPrototype: <T>(service: T): string[] => {
    const result: string[] = [];
    let prototype = service;
    while (prototype && Object.getPrototypeOf(prototype) !== null) {
      for (const prop of Object.getOwnPropertyNames(prototype)) {
        if ((prop as any) === 'constructor') {
          continue;
        }

        const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
        const isGetterSetter = descriptor && (descriptor.get || descriptor.set);
        if (!isGetterSetter || result.indexOf(prop) !== -1) {
          continue;
        }
        result.push(prop);
      }
      prototype = Object.getPrototypeOf(prototype);
    }
    return result;
  },

  extractPropertyDescriptor: <T>(service: T, prop: string): PropertyDescriptor | undefined => {
    let prototype = service;
    while (prototype && Object.getPrototypeOf(prototype) !== null) {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
      if (descriptor) {
        return descriptor;
      }
      prototype = Object.getPrototypeOf(prototype);
    }
  },

  mock: <T = MockedFunction>(instance: any, name: string, accessType?: 'get' | 'set'): T => {
    const def = Object.getOwnPropertyDescriptor(instance, name);
    if (def && def[accessType || 'value']) {
      return def[accessType || 'value'];
    }

    const mockName = `${
      typeof instance.prototype === 'function'
        ? instance.prototype.name
        : typeof instance.constructor === 'function'
        ? instance.constructor.name
        : 'unknown'
    }.${name}${accessType ? `:${accessType}` : ''}`;
    const mock: any = mockServiceHelperPrototype.mockFunction(mockName, !!accessType);

    const mockDef: PropertyDescriptor = {
      // keeping setter if we adding getter
      ...(accessType === 'get' && def && def.set
        ? {
            set: def.set,
          }
        : {}),

      // keeping getter if we adding setter
      ...(accessType === 'set' && def && def.get
        ? {
            get: def.get,
          }
        : {}),

      // to allow replacement for functions
      ...(accessType
        ? {}
        : {
            writable: true,
          }),

      [accessType || 'value']: mock,
      configurable: true,
      enumerable: true,
    };

    if (mockDef.get && mockDef.set && (mockDef.get as any).__ngMocks && (mockDef.set as any).__ngMocks) {
      (mockDef.set as any).__ngMocksSet((val: any) => (mockDef.get as any).__ngMocksGet(val));
    }

    Object.defineProperty(instance, name, mockDef);
    return mock;
  },

  replaceWithMocks(value: any): any {
    if (ngMocksUniverse.cache.has(value)) {
      return ngMocksUniverse.cache.get(value);
    }
    if (typeof value !== 'object') {
      return value;
    }
    let mocked: any;
    let updated = false;
    if (Array.isArray(value)) {
      mocked = [];
      for (let key = 0; key < value.length; key += 1) {
        mocked[key] = mockServiceHelper.replaceWithMocks(value[key]);
        updated = updated || mocked[key] !== value[key];
      }
    } else if (value) {
      mocked = {};
      for (const key of Object.keys(value)) {
        mocked[key] = mockServiceHelper.replaceWithMocks(value[key]);
        updated = updated || mocked[key] !== value[key];
      }
    }
    if (updated) {
      Object.setPrototypeOf(mocked, Object.getPrototypeOf(value));
      return mocked;
    }
    return value;
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
  extractMethodsFromPrototype(service: any): string[];
  extractPropertiesFromPrototype(service: any): string[];
  extractPropertyDescriptor(service: any, prop: string): PropertyDescriptor | undefined;
  mock<T = MockedFunction>(instance: any, name: string, style?: 'get' | 'set'): T;
  mockFunction(mockName: string): MockedFunction;
  registerMockFunction(mockFunction: (mockName: string) => MockedFunction | undefined): void;
  replaceWithMocks(value: any): any;
} = ((window as any) || (global as any)).ngMocksMockServiceHelper;

export function MockService(service?: boolean | number | string | null, mockNamePrefix?: string): undefined;
export function MockService<T>(service: new (...args: any[]) => T, mockNamePrefix?: string): T;
// tslint:disable-next-line:no-misused-new unified-signatures
export function MockService<T = any>(service: object, mockNamePrefix?: string): T;
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
      const mock: any = MockService(service[property], `${mockNamePrefix ? mockNamePrefix : 'instance'}.${property}`);
      if (mock !== undefined) {
        value[property] = mock;
      }
    }
    Object.setPrototypeOf(value, Object.getPrototypeOf(service));
  }

  return value;
}

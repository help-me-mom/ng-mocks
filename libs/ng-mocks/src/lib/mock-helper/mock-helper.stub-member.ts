import helperExtractPropertyDescriptor from '../mock-service/helper.extract-property-descriptor';

export default <T extends object>(
  instance: T & { __ngMocks__source?: object },
  key: any,
  value: any,
  encapsulation?: 'get' | 'set',
): any => {
  const def = helperExtractPropertyDescriptor(instance, key) ?? {};

  if (!encapsulation && def.set && (def.set as any).__ngMocksProxy) {
    def.set(value);

    return value;
  }

  const descriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: true,
  };
  if (encapsulation === 'get' && def.set) {
    descriptor.set = def.set;
  } else if (encapsulation === 'set' && def.get) {
    descriptor.get = def.get;
  }
  if (encapsulation) {
    descriptor[encapsulation] = value;
  } else {
    descriptor.writable = true;
    descriptor.value = value;
  }

  Object.defineProperty(instance, key, descriptor);

  return value;
};

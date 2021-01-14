export default <T extends object>(instance: T, key: any, value: any, encapsulation?: 'get' | 'set'): any => {
  const def = Object.getOwnPropertyDescriptor(instance, key) || {};

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

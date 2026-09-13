import checkIsObjectPrototype from './check.is-object-prototype';

export default <T>(service: T, prop: keyof any): PropertyDescriptor | undefined => {
  let prototype = service;
  while (prototype && !checkIsObjectPrototype(prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
    if (descriptor) {
      return descriptor;
    }
    prototype = Object.getPrototypeOf(prototype);
  }

  return undefined;
};

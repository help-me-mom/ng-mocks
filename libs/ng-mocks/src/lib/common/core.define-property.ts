export default (instance: any, property: keyof any, value: any, enumerable = false) => {
  // istanbul ignore else
  if (Object.defineProperty) {
    Object.defineProperty(instance, property, {
      configurable: true,
      enumerable,
      value,
      writable: true,
    });
  } else {
    instance[property] = value;
  }
};

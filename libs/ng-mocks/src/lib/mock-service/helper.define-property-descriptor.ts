export default (instance: any, prop: keyof any, desc?: PropertyDescriptor): boolean => {
  if (!desc || !instance) {
    return false;
  }

  // istanbul ignore else
  if (Object.defineProperty) {
    // An own property can shadow a locked ancestor without changing it.
    const sourceDesc = Object.getOwnPropertyDescriptor(instance, prop);
    if (sourceDesc?.configurable === false) {
      return false;
    }

    Object.defineProperty(instance, prop, {
      ...desc,
      configurable: true,
      ...((desc.get === undefined && desc.set === undefined) || desc.writable === false ? { writable: true } : {}),
    });
  } else {
    instance[prop] = desc.value;
  }

  return true;
};

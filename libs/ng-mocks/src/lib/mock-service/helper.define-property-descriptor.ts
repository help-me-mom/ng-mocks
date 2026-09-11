import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';

export default (
  instance: any,
  prop: keyof any,
  desc?: PropertyDescriptor,
  options: { configurable?: boolean; checkInherited?: boolean } = {},
): boolean => {
  if (!desc || !instance) {
    return false;
  }

  // istanbul ignore else
  if (Object.defineProperty) {
    // Defining an own property may shadow a locked ancestor; descriptor copying
    // retains its existing inherited-property protection by default.
    const sourceDesc =
      options.checkInherited === false
        ? Object.getOwnPropertyDescriptor(instance, prop)
        : helperExtractPropertyDescriptor(instance, prop);
    if (sourceDesc?.configurable === false) {
      return false;
    }

    Object.defineProperty(instance, prop, {
      ...desc,
      configurable: options.configurable ?? true,
      ...((desc.get === undefined && desc.set === undefined) || desc.writable === false ? { writable: true } : {}),
    });
  } else {
    instance[prop] = desc.value;
  }

  return true;
};

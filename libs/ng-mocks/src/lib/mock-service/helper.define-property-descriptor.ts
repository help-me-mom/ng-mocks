import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';

export default (instance: any, prop: keyof any, desc?: PropertyDescriptor): boolean => {
  if (!desc || !instance) {
    return false;
  }

  // istanbul ignore else
  if (Object.defineProperty) {
    const sourceDesc = helperExtractPropertyDescriptor(instance, prop);
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

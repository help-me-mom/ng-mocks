import helperMockService from '../mock-service/helper.mock-service';

const createProperty = (pointComponentInstance: Record<keyof any, any>, key: string) => {
  return {
    configurable: true,
    get: () => {
      if (typeof pointComponentInstance[key] === 'function') {
        return (...args: any[]) => pointComponentInstance[key](...args);
      }

      return pointComponentInstance[key];
    },
    set: (v: any) => (pointComponentInstance[key] = v),
  };
};

const extractAllKeys = (instance: object) => [
  ...helperMockService.extractPropertiesFromPrototype(Object.getPrototypeOf(instance)),
  ...helperMockService.extractMethodsFromPrototype(Object.getPrototypeOf(instance)),
  ...Object.keys(instance),
];

const extractOwnKeys = (instance: object) => [...Object.getOwnPropertyNames(instance), ...Object.keys(instance)];

export default (reader: Record<keyof any, any>, source?: Record<keyof any, any>, force: boolean = false): void => {
  if (!source) {
    return;
  }
  const exists = extractOwnKeys(reader);
  for (const key of extractAllKeys(source)) {
    if (!force && exists.indexOf(key) !== -1) {
      continue;
    }
    Object.defineProperty(reader, key, createProperty(source, key));
    exists.push(key);
  }
};

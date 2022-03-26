import coreDefineProperty from '../common/core.define-property';
import helperDefinePropertyDescriptor from '../mock-service/helper.define-property-descriptor';
import helperMockService from '../mock-service/helper.mock-service';

const createPropertyGet = (key: keyof any & string, reader: Record<keyof any, any>, source: Record<keyof any, any>) => {
  const handler = () => {
    if (typeof source[key] === 'function') {
      if (reader[`__ngMocks_${key}__origin`] !== source[key]) {
        const clone = helperMockService.createClone(source[key], reader, source);
        coreDefineProperty(reader, `__ngMocks_${key}`, clone, false);
        coreDefineProperty(reader, `__ngMocks_${key}__origin`, source[key], false);
      }

      return reader[`__ngMocks_${key}`];
    }

    return source[key];
  };
  coreDefineProperty(handler, '__ngMocksProxy', true, false);

  return handler;
};

const createPropertySet = (key: keyof any & string, reader: Record<keyof any, any>, source: Record<keyof any, any>) => {
  const handler = (newValue: any) => {
    if (reader[`__ngMocks_${key}`]) {
      reader[`__ngMocks_${key}`] = undefined;
    }
    if (reader[`__ngMocks_${key}__origin`]) {
      reader[`__ngMocks_${key}__origin`] = undefined;
    }
    source[key] = newValue;
  };
  coreDefineProperty(handler, '__ngMocksProxy', true, false);

  return handler;
};

const extractAllKeys = (instance: object) => [
  ...helperMockService.extractPropertiesFromPrototype(Object.getPrototypeOf(instance)),
  ...helperMockService.extractMethodsFromPrototype(Object.getPrototypeOf(instance)),
  ...Object.keys(instance),
];

const extractOwnKeys = (instance: object) => [...Object.getOwnPropertyNames(instance), ...Object.keys(instance)];

export default (
  reader: Record<keyof any, any>,
  source: Record<keyof any, any> | undefined,
  extra: string[],
  force: boolean = false,
): void => {
  if (!source) {
    return;
  }
  coreDefineProperty(reader, '__ngMocks__source', source, false);
  const exists = extractOwnKeys(reader);
  const fields = [...extractAllKeys(source), ...extra];
  for (const key of fields) {
    if (!force && exists.indexOf(key) !== -1) {
      continue;
    }
    helperDefinePropertyDescriptor(reader, key, {
      get: createPropertyGet(key, reader, source),
      set: createPropertySet(key, reader, source),
    });
    exists.push(key);
  }
};

import coreDefineProperty from '../common/core.define-property';
import helperDefinePropertyDescriptor from '../mock-service/helper.define-property-descriptor';
import helperMockService from '../mock-service/helper.mock-service';

const createPropertyGet = (
  key: keyof any & string,
  reader: Record<keyof any, any>,
  source: Record<keyof any, any>,
  valueKeys: string[],
) => {
  const handler = () => {
    if (typeof source[key] === 'function' && valueKeys.indexOf(key) === -1) {
      if (reader[`__ngMocks_${key}__origin`] !== source[key]) {
        const clone = helperMockService.createClone(source[key], reader, source);
        coreDefineProperty(reader, `__ngMocks_${key}`, clone);
        coreDefineProperty(reader, `__ngMocks_${key}__origin`, source[key]);
      }

      return reader[`__ngMocks_${key}`];
    }

    return source[key];
  };
  coreDefineProperty(handler, '__ngMocksProxy', true);

  return handler;
};

const createPropertySet = (
  key: keyof any & string,
  reader: Record<keyof any, any>,
  source: Record<keyof any, any>,
  writeSource?: (key: string, value: any) => boolean,
) => {
  const handler = (newValue: any) => {
    if (reader[`__ngMocks_${key}`]) {
      reader[`__ngMocks_${key}`] = undefined;
    }
    if (reader[`__ngMocks_${key}__origin`]) {
      reader[`__ngMocks_${key}__origin`] = undefined;
    }
    if (!writeSource || !writeSource(key, newValue)) {
      source[key] = newValue;
    }
  };
  coreDefineProperty(handler, '__ngMocksProxy', true);

  return handler;
};

const extractAllKeys = (instance: object) => {
  const properties: string[] = [];
  const methods = helperMockService.extractMethodsFromPrototype(Object.getPrototypeOf(instance), properties);

  return [...properties, ...methods, ...Object.keys(instance)];
};

const extractOwnKeys = (instance: object) => new Set(Object.getOwnPropertyNames(instance));

export default (
  reader: Record<keyof any, any>,
  source: Record<keyof any, any> | undefined,
  extra: string[],
  force = false,
  valueKeys: string[] = [],
  writeSource?: (key: string, value: any) => boolean,
): void => {
  if (!source) {
    return;
  }
  coreDefineProperty(reader, '__ngMocks__source', source);
  const exists = extractOwnKeys(reader);
  const fields = [...extractAllKeys(source), ...extra];
  for (const key of fields) {
    if (!force && exists.has(key)) {
      continue;
    }
    helperDefinePropertyDescriptor(reader, key, {
      get: createPropertyGet(key, reader, source, valueKeys),
      set: createPropertySet(key, reader, source, writeSource),
    });
    exists.add(key);
  }
};

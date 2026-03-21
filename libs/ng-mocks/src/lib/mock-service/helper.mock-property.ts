import coreDefineProperty from '../common/core.define-property';

import helperMockService from './helper.mock-service';

const attachMockState = (target: any, source: any): void => {
  for (const key of [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]) {
    if (
      ['__ngMocks', '__ngMocksGet', '__ngMocksSet', 'arguments', 'caller', 'length', 'name', 'prototype'].indexOf(
        String(key),
      ) !== -1 ||
      Object.getOwnPropertyDescriptor(target, key)
    ) {
      continue;
    }

    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: false,
      get: () => {
        const current = source[key];

        return typeof current === 'function' ? current.bind(source) : current;
      },
      set: newValue => {
        source[key] = newValue;
      },
    });
  }
};

const createPropertyAccessorMock = (mockName: string, accessType: 'get' | 'set'): any => {
  const tracker: any = helperMockService.mockFunction(mockName);
  let value: any;
  let setValue: any;

  const accessor: any = (...args: any[]) => {
    tracker(...args);
    if (accessType === 'set' && setValue) {
      setValue(args[0]);
    }

    return value;
  };

  attachMockState(accessor, tracker);
  coreDefineProperty(accessor, '__ngMocks', true);
  coreDefineProperty(accessor, '__ngMocksSet', (newSetValue: any) => (setValue = newSetValue));
  coreDefineProperty(accessor, '__ngMocksGet', (newValue: any) => (value = newValue));

  return accessor;
};

const applyMockProperty = (value: Record<keyof any, any>, property: string, mock: any, prefix: string): void => {
  if (typeof mock === 'function') {
    value[property] = mock;

    return;
  }

  const getter: any = createPropertyAccessorMock(`${prefix}.${property}get`, 'get');
  getter.__ngMocksGet(mock);
  const setter: any = createPropertyAccessorMock(`${prefix}.${property}set`, 'set');
  setter.__ngMocksSet((newValue: any) => getter.__ngMocksGet(newValue));
  Object.defineProperty(value, property, {
    configurable: true,
    enumerable: true,
    get: getter,
    set: setter,
  });
};

export default applyMockProperty;

export const normalizeMockProperties = (value: Record<keyof any, any> | undefined, prefix: string): void => {
  if (!value || typeof value !== 'object') {
    return;
  }

  for (const property of Object.keys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, property);
    if (
      !descriptor ||
      descriptor.get ||
      descriptor.set ||
      typeof descriptor.value === 'function' ||
      !descriptor.value ||
      typeof descriptor.value !== 'object'
    ) {
      continue;
    }

    // Some integration paths can flatten mocked nested objects back into
    // value properties. Reinstalling accessor spies keeps property assertions
    // consistent with direct MockService results.
    applyMockProperty(value, property, descriptor.value, prefix);
  }
};

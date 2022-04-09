import coreDefineProperty from '../common/core.define-property';

import { CustomMockFunction, MockedFunction } from './types';

const mockFunction: {
  (mockName: string, original?: boolean): MockedFunction;
  customMockFunction?: CustomMockFunction;
} = (mockName: string, original = false): MockedFunction => {
  const func =
    mockFunction.customMockFunction && !original
      ? mockFunction.customMockFunction(mockName)
      : (val: any) => {
          if (setValue) {
            setValue(val);
          }

          return value;
        };

  // magic to make getters / setters working

  let value: any;
  let setValue: any;

  coreDefineProperty(func, '__ngMocks', true);
  coreDefineProperty(func, '__ngMocksSet', (newSetValue: any) => (setValue = newSetValue));
  coreDefineProperty(func, '__ngMocksGet', (newValue: any) => (value = newValue));

  return func;
};

export default (() => mockFunction)();

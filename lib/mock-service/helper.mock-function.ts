import { CustomMockFunction, MockedFunction } from './types';

const mockFunction: {
  (mockName: string, original?: boolean): MockedFunction;
  customMockFunction?: CustomMockFunction;
} = (mockName: string, original: boolean = false): MockedFunction => {
  let func: any;
  if (mockFunction.customMockFunction && !original) {
    func = mockFunction.customMockFunction(mockName);
  } else {
    func = (val: any) => {
      if (setValue) {
        setValue(val);
      }
      return value;
    };
  }

  // magic to make getters / setters working

  let value: any;
  let setValue: any;

  func.__ngMocks = true;
  func.__ngMocksSet = (newSetValue: any) => (setValue = newSetValue);
  func.__ngMocksGet = (newValue: any) => (value = newValue);

  return func;
};

export default mockFunction;

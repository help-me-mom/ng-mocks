import coreDefineProperty from '../common/core.define-property';
import funcGetName from '../common/func.get-name';

import helperMockService from './helper.mock-service';
import { MockedFunction } from './types';

export default (service: any): { [key in keyof any]: MockedFunction } => {
  const mockName = funcGetName(service);
  const value: any = {};
  coreDefineProperty(value, '__ngMocks', true);

  const methods = helperMockService.extractMethodsFromPrototype(service);
  for (const method of methods) {
    helperMockService.mock(value, method, mockName);
  }

  const properties = helperMockService.extractPropertiesFromPrototype(service);
  for (const property of properties) {
    helperMockService.mock(value, property, 'get', mockName);
    helperMockService.mock(value, property, 'set', mockName);
  }
  Object.setPrototypeOf(value, service);

  return value;
};

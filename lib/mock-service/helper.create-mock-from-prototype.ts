import mockServiceHelper from './helper';
import { MockedFunction } from './types';

export default (service: any): { [key in keyof any]: MockedFunction } => {
  const mockName = `${service && service.constructor ? service.constructor.name : 'unknown'}`;
  const value: any = {};

  const methods = mockServiceHelper.extractMethodsFromPrototype(service);
  for (const method of methods) {
    mockServiceHelper.mock(value, method, mockName);
  }

  const properties = mockServiceHelper.extractPropertiesFromPrototype(service);
  for (const property of properties) {
    mockServiceHelper.mock(value, property, 'get', mockName);
    mockServiceHelper.mock(value, property, 'set', mockName);
  }

  if (typeof value === 'object' && typeof service === 'object') {
    Object.setPrototypeOf(value, service);
  }

  return value;
};

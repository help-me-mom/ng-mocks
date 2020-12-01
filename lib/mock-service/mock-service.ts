import { AnyType } from '../common/core.types';
import mockHelperStub from '../mock-helper/mock-helper.stub';

import checkIsClass from './check.is-class';
import checkIsFunc from './check.is-func';
import checkIsInst from './check.is-inst';
import helperMockService from './helper.mock-service';

const mockVariable = (service: any, prefix: string, callback: typeof MockService) => {
  let value: any;

  if (checkIsClass(service)) {
    value = helperMockService.createMockFromPrototype(service.prototype);
  } else if (checkIsFunc(service)) {
    value = helperMockService.mockFunction(`func:${prefix || service.name || 'arrow-function'}`);
  } else if (Array.isArray(service)) {
    value = [];
  } else if (checkIsInst(service)) {
    value = helperMockService.createMockFromPrototype(service.constructor.prototype);
    for (const property of Object.keys(service)) {
      const mock: any = callback(service[property], `${prefix || 'instance'}.${property}`);
      if (mock !== undefined) {
        value[property] = mock;
      }
    }
    Object.setPrototypeOf(value, Object.getPrototypeOf(service));
  }

  return value;
};

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-service
 */
export function MockService(service: boolean | number | string | null | undefined): undefined;

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-service
 */
export function MockService<T>(service: AnyType<T>, overrides?: Partial<T>, mockNamePrefix?: string): T;

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-service
 */
export function MockService<T>(service: AnyType<T>, mockNamePrefix?: string): T;

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-service
 */
export function MockService<T = any>(service: object, mockNamePrefix?: string): T;

export function MockService(service: any, ...args: any[]): any {
  // mocking all methods / properties of a class / object.

  const mockNamePrefix = args.length > 0 && typeof args[0] === 'string' ? args[0] : args[1];
  const overrides = args.length > 0 && args[0] && typeof args[0] === 'object' ? args[0] : undefined;

  const value: any = mockVariable(service, mockNamePrefix, MockService);

  if (overrides) {
    mockHelperStub(value, overrides);
  }

  return value;
}

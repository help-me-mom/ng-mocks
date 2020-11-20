// tslint:disable:no-misused-new unified-signatures

import { AnyType } from '../common/core.types';
import ngMocksStub from '../mock-helper/mock-helper.stub';

import isClass from './func.is-class';
import isFunc from './func.is-func';
import isInst from './func.is-inst';
import mockServiceHelper from './helper';

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-service
 */
export function MockService(service?: boolean | number | string | null): undefined;

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
  let value: any;

  const mockNamePrefix = args.length > 0 && typeof args[0] === 'string' ? args[0] : args[1];
  const overrides = args.length > 0 && args[0] && typeof args[0] === 'object' ? args[0] : undefined;

  if (isClass(service)) {
    value = mockServiceHelper.createMockFromPrototype(service.prototype);
  } else if (isFunc(service)) {
    value = mockServiceHelper.mockFunction(
      `func:${mockNamePrefix ? mockNamePrefix : service.name || 'arrow-function'}`,
    );
  } else if (Array.isArray(service)) {
    value = [];
  } else if (isInst(service)) {
    value = mockServiceHelper.createMockFromPrototype(service.constructor.prototype);
    for (const property of Object.keys(service)) {
      const mock: any = MockService(service[property], `${mockNamePrefix ? mockNamePrefix : 'instance'}.${property}`);
      if (mock !== undefined) {
        value[property] = mock;
      }
    }
    Object.setPrototypeOf(value, Object.getPrototypeOf(service));
  }

  if (overrides) {
    ngMocksStub(value, overrides);
  }

  return value;
}

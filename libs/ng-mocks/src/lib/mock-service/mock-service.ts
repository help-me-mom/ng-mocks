import { AnyType } from '../common/core.types';
import funcGetName from '../common/func.get-name';
import mockHelperStub from '../mock-helper/mock-helper.stub';

import checkIsClass from './check.is-class';
import checkIsFunc from './check.is-func';
import checkIsInst from './check.is-inst';
import helperMockService from './helper.mock-service';

type MockServiceHandler = (cache: Map<any, any>, service: any, prefix?: string, overrides?: any) => any;

const mockVariableMap: Array<[(def: any) => boolean, MockServiceHandler]> = [
  [
    checkIsClass,
    (cache, service) => {
      const value = helperMockService.createMockFromPrototype(service.prototype);
      cache.set(service, value);

      return value;
    },
  ],
  [
    checkIsFunc,
    (cache, service, prefix) => {
      const value = helperMockService.mockFunction(`func:${prefix || funcGetName(service)}`);
      cache.set(service, value());

      return value;
    },
  ],
  [def => Array.isArray(def), () => []],
  [
    checkIsInst,
    (cache, service, prefix, callback) => {
      const value = helperMockService.createMockFromPrototype(service.constructor.prototype);
      cache.set(service, value);
      for (const property of Object.keys(service)) {
        const mock: any = callback(cache, service[property], `${prefix || 'instance'}.${property}`);
        if (mock !== undefined) {
          value[property] = mock;
        }
      }
      Object.setPrototypeOf(value, Object.getPrototypeOf(service));

      return value;
    },
  ],
];

const mockVariable = (cache: Map<any, any>, service: any, prefix: string, callback: MockServiceHandler) => {
  for (const [check, createMock] of mockVariableMap) {
    if (!check(service)) {
      continue;
    }

    return cache.get(service) ?? createMock(cache, service, prefix, callback);
  }
};

/**
 * Mocking all methods / properties of a class / object.
 */
const mockService: MockServiceHandler = (cache, service, prefix = '', overrides): any => {
  const value: any = mockVariable(cache, service, prefix, mockService);

  if (overrides) {
    mockHelperStub(value, overrides);
  }

  return value;
};

/**
 * MockService creates a mock instance out of an object or a class.
 * Primitives are converted to undefined.
 *
 * @see https://ng-mocks.sudo.eu/api/MockService
 */
export function MockService(service: boolean | number | string | null | undefined): undefined;

/**
 * MockService creates a mock instance out of an object or a class.
 *
 * @see https://ng-mocks.sudo.eu/api/MockService
 *
 * ```ts
 * const service = MockService(AuthService);
 * service.login(); // does nothing, it's dummy.
 */
export function MockService<T>(service: AnyType<T>, spyNamePrefix?: string): T;

/**
 * MockService creates a mock instance out of an object or a class.
 *
 * @see https://ng-mocks.sudo.eu/api/MockService
 *
 * ```ts
 * const mockUser = MockService(currentUser);
 * mockUser.save(); // does nothing, it's dummy.
 */
export function MockService<T = any>(service: object, spyNamePrefix?: string): T;

/**
 * MockService creates a mock instance out of an object or a class.
 * The second parameter can be used as overrides.
 *
 * @see https://ng-mocks.sudo.eu/api/MockService
 *
 * ```ts
 * const service = MockService(AuthService, {
 *   loggedIn: true,
 * });
 * service.login(); // does nothing, it's dummy.
 * ```
 */
export function MockService<T>(service: AnyType<T>, overrides?: Partial<T>, spyNamePrefix?: string): T;

export function MockService(service: any, ...args: any[]): any {
  const prefix = args.length > 0 && typeof args[0] === 'string' ? args[0] : args[1];
  const overrides = args.length > 0 && args[0] && typeof args[0] === 'object' ? args[0] : undefined;

  const cache = new Map();
  const result = mockService(cache, service, prefix, overrides);
  cache.clear();

  return result;
}

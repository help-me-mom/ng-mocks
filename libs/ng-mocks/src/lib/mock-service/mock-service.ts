import { AnyType } from '../common/core.types';
import funcGetName from '../common/func.get-name';
import mockHelperStub from '../mock-helper/mock-helper.stub';

import checkIsClass from './check.is-class';
import checkIsFunc from './check.is-func';
import checkIsInst from './check.is-inst';
import helperMockService from './helper.mock-service';

const mockVariableMap: Array<
  [(def: any) => boolean, (service: any, prefix: string, callback: typeof MockService) => any]
> = [
  [checkIsClass, (service: any) => helperMockService.createMockFromPrototype(service.prototype)],
  [
    checkIsFunc,
    (service: any, prefix: string) => helperMockService.mockFunction(`func:${prefix || funcGetName(service)}`),
  ],
  [def => Array.isArray(def), () => []],
  [
    checkIsInst,
    (service, prefix, callback) => {
      const value = helperMockService.createMockFromPrototype(service.constructor.prototype);
      for (const property of Object.keys(service)) {
        const mock: any = callback(service[property], `${prefix || 'instance'}.${property}`);
        if (mock !== undefined) {
          value[property] = mock;
        }
      }
      Object.setPrototypeOf(value, Object.getPrototypeOf(service));

      return value;
    },
  ],
];

const mockVariable = (service: any, prefix: string, callback: typeof MockService) => {
  for (const [check, createMock] of mockVariableMap) {
    if (!check(service)) {
      continue;
    }

    return createMock(service, prefix, callback);
  }
};

/**
 * @see https://ng-mocks.sudo.eu/api/MockService
 */
export function MockService(service: boolean | number | string | null | undefined): undefined;

/**
 * @see https://ng-mocks.sudo.eu/api/MockService
 */
export function MockService<T>(service: AnyType<T>, overrides?: Partial<T>, mockNamePrefix?: string): T;

/**
 * @see https://ng-mocks.sudo.eu/api/MockService
 */
export function MockService<T>(service: AnyType<T>, mockNamePrefix?: string): T;

/**
 * @see https://ng-mocks.sudo.eu/api/MockService
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

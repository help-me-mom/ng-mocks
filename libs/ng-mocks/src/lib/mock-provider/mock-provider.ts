import { FactoryProvider, InjectionToken, Provider } from '@angular/core';

import { AnyType } from '../common/core.types';
import funcImportExists from '../common/func.import-exists';
import mockHelperStub from '../mock-helper/mock-helper.stub';
import helperUseFactory from '../mock-service/helper.use-factory';
import { MockService } from '../mock-service/mock-service';

const defaultValue = {};

/**
 * MockProviders creates an array of mock providers out of passed as parameters.
 *
 * @see https://ng-mocks.sudo.eu/api/MockProvider
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   providers: MockProviders(
 *     Dep1Service,
 *     Dep2Service,
 *   ),
 * });
 * ```
 */
export function MockProviders(...providers: Array<AnyType<any> | InjectionToken<any>>): FactoryProvider[] {
  return providers.map((provider: any) => MockProvider(provider, defaultValue));
}

/**
 * MockProvider creates a mock provider out of passed an arbitrary service.
 *
 * @see https://ng-mocks.sudo.eu/api/MockProvider
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   providers: [
 *     MockProvider(Dep1Service),
 *     MockProvider(Dep2Service, {
 *       prop: true,
 *       func: () => 'mock',
 *     }),
 *   ],
 * });
 * ```
 */
export function MockProvider<I extends object>(instance: AnyType<I>, overrides?: Partial<I>): FactoryProvider;

/**
 * MockProvider creates a mock provider out of passed an arbitrary token.
 *
 * @see https://ng-mocks.sudo.eu/api/MockProvider
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   providers: [
 *     MockProvider(APP_ID),
 *     MockProvider(WEB_SOCKET, {
 *       prop: true,
 *       func: () => 'mock',
 *     }),
 *   ],
 * });
 * ```
 */
export function MockProvider<I>(provider: InjectionToken<I>, useValue?: Partial<I>): FactoryProvider;

/**
 * MockProvider creates a mock provider out of passed an arbitrary string token.
 *
 * @see https://ng-mocks.sudo.eu/api/MockProvider
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   providers: [
 *     MockProvider('web_socket', {
 *       prop: true,
 *       func: () => 'mock',
 *     }),
 *   ],
 * });
 * ```
 */
export function MockProvider<I = any>(provider: string, useValue?: Partial<I>): FactoryProvider;

export function MockProvider(provide: any, overrides: any = defaultValue): Provider {
  funcImportExists(provide, 'MockProvider');

  return helperUseFactory(
    provide,
    () => MockService(provide),
    value => {
      if (overrides === defaultValue) {
        return value;
      }
      if (!value) {
        return overrides;
      }

      return mockHelperStub(value, overrides);
    },
  );
}

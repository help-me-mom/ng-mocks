import { FactoryProvider, InjectionToken, Provider } from '@angular/core';

import { AnyType } from '../common/core.types';
import funcImportExists from '../common/func.import-exists';
import mockHelperStub from '../mock-helper/mock-helper.stub';
import helperUseFactory from '../mock-service/helper.use-factory';
import { MockService } from '../mock-service/mock-service';

const defaultValue = {};

export function MockProviders(...providers: Array<AnyType<any> | InjectionToken<any>>): FactoryProvider[] {
  return providers.map((provider: any) => MockProvider(provider, defaultValue));
}

/**
 * @see https://ng-mocks.sudo.eu/api/MockProvider
 */
export function MockProvider<I extends object>(instance: AnyType<I>, overrides?: Partial<I>): FactoryProvider;

/**
 * @see https://ng-mocks.sudo.eu/api/MockProvider
 */
export function MockProvider<I>(provider: InjectionToken<I> | string, useValue?: Partial<I>): FactoryProvider;

/**
 * @see https://ng-mocks.sudo.eu/api/MockProvider
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

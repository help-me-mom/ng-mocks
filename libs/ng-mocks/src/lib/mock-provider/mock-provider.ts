import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  InjectionToken,
  Provider,
  StaticClassProvider,
  ValueProvider,
} from '@angular/core';

import { AnyDeclaration, AnyType } from '../common/core.types';
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
export function MockProviders(...providers: Array<AnyDeclaration<any>>): FactoryProvider[] {
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

/**
 * MockProvider generates useValue based on passed parameters.
 *
 * @see https://ng-mocks.sudo.eu/api/MockProvider#useValue
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   providers: [
 *     MockProvider(AuthService, {isLoggedIn: true}, 'useValue'),
 *     MockProvider(APP_ROUTES, 5, 'useValue', true), // multi flag
 *   ],
 * });
 * ```
 */
export function MockProvider<I>(
  provider: AnyDeclaration<I>,
  value: ValueProvider['useValue'],
  style: 'useValue',
  multi?: ValueProvider['multi'],
): ValueProvider;

/**
 * MockProvider generates useExisting based on passed parameters.
 *
 * @see https://ng-mocks.sudo.eu/api/MockProvider#useExisting
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   providers: [
 *     MockProvider(AuthService, MockAuthService, 'useExisting', true),
 *     MockProvider(APP_ROUTES, MOCK_ROUTES, 'useExisting', true), // multi flag
 *   ],
 * });
 * ```
 */
export function MockProvider<I>(
  provider: AnyDeclaration<I>,
  value: ExistingProvider['useExisting'],
  style: 'useExisting',
  multi?: ExistingProvider['multi'],
): ExistingProvider;

/**
 * MockProvider generates useClass based on passed parameters.
 *
 * @see https://ng-mocks.sudo.eu/api/MockProvider#useClass
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   providers: [
 *     MockProvider(AuthService, MockAuthService, 'useClass', [ctorDep1, ctorDep2]),
 *     MockProvider(UserService, MockUserService, 'useClass', {
 *       multi: true, // multi flag
 *       deps: [ctorDep1, ctorDep2],
 *     }),
 *   ],
 * });
 * ```
 */
export function MockProvider<I>(
  provider: AnyDeclaration<I>,
  value: StaticClassProvider['useClass'],
  style: 'useClass',
  multiDeps?:
    | StaticClassProvider['multi']
    | StaticClassProvider['deps']
    | {
        multi?: StaticClassProvider['multi'];
        deps?: StaticClassProvider['deps'];
      },
): ClassProvider;

/**
 * MockProvider generates useFactory based on passed parameters.
 *
 * @see https://ng-mocks.sudo.eu/api/MockProvider#useFactory
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   providers: [
 *     MockProvider(AuthService, (dep1, dep2) => {
 *       // ...
 *     }, 'useFactory', [ctorDep1, ctorDep2]),
 *     MockProvider(UserService, (dep1, dep2) => {
 *       // ...
 *     }, 'useFactory', {
 *       multi: true, // multi flag
 *       deps: [ctorDep1, ctorDep2],
 *     }),
 *   ],
 * });
 * ```
 */
export function MockProvider<I>(
  provider: AnyDeclaration<I>,
  value: FactoryProvider['useFactory'],
  style: 'useFactory',
  multiDeps?:
    | FactoryProvider['multi']
    | FactoryProvider['deps']
    | {
        multi?: FactoryProvider['multi'];
        deps?: FactoryProvider['deps'];
      },
): FactoryProvider;

export function MockProvider(
  provide: any,
  overrides: any = defaultValue,
  style?: 'useValue' | 'useExisting' | 'useClass' | 'useFactory',
  flags:
    | boolean
    | any[]
    | {
        deps?: any[];
        multi?: boolean;
      } = {},
): Provider {
  funcImportExists(provide, 'MockProvider');

  const { deps, multi } =
    typeof flags === 'boolean'
      ? { deps: undefined, multi: flags }
      : Array.isArray(flags)
      ? {
          deps: flags,
          multi: undefined,
        }
      : flags;

  if (style) {
    return {
      provide,
      [style]: overrides,
      deps,
      multi,
    };
  }

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

import { InjectionToken, Injector } from '@angular/core';

import { AnyDeclaration, AnyType } from '../common/core.types';
import funcImportExists from '../common/func.import-exists';
import ngMocksStack, { NgMocksStack } from '../common/ng-mocks-stack';
import ngMocksUniverse from '../common/ng-mocks-universe';

import mockInstanceForgotReset from './mock-instance-forgot-reset';

let currentStack: NgMocksStack;
ngMocksStack.subscribePush(state => {
  currentStack = state;
});
ngMocksStack.subscribePop((state, stack) => {
  for (const declaration of state.mockInstance || /* istanbul ignore next */ []) {
    if (ngMocksUniverse.configInstance.has(declaration)) {
      const universeConfig = ngMocksUniverse.configInstance.get(declaration);
      universeConfig.overloads.pop();
      ngMocksUniverse.configInstance.set(declaration, {
        ...universeConfig,
      });
    }
  }
  currentStack = stack[stack.length - 1];
});

interface MockInstanceArgs {
  accessor?: 'get' | 'set';
  data?: any;
  key?: string;
  value?: any;
}

const parseMockInstanceArgs = (args: any[]): MockInstanceArgs => {
  const set: MockInstanceArgs = {};

  if (typeof args[0] === 'string') {
    set.key = args[0];
    set.value = args[1];
    set.accessor = args[2];
  } else {
    set.value = args[0];
    if (set.value && typeof set.value === 'object') {
      set.value = set.value.init;
    }
  }

  return set;
};

const checkReset: Array<[any, any, any?]> = [];
let checkCollect = false;

// istanbul ignore else: maybe a different runner is used
if (typeof beforeEach !== 'undefined') {
  beforeEach(() => (checkCollect = true));
  beforeEach(() => mockInstanceForgotReset(checkReset));
  afterEach(() => (checkCollect = false));
}

const mockInstanceConfig = <T>(
  declaration: AnyDeclaration<T>,
  name: string | undefined,
  stub: any,
  encapsulation?: 'get' | 'set',
) => {
  const config = ngMocksUniverse.configInstance.has(declaration) ? ngMocksUniverse.configInstance.get(declaration) : {};
  const overloads = config.overloads || [];
  overloads.push([name, stub, encapsulation]);
  config.overloads = overloads;
  ngMocksUniverse.configInstance.set(declaration, {
    ...config,
  });
  const mockInstances = currentStack.mockInstance ?? [];
  mockInstances.push(declaration);
  currentStack.mockInstance = mockInstances;

  if (checkCollect) {
    checkReset.push([declaration, ngMocksUniverse.configInstance.get(declaration), currentStack]);
  }

  return stub;
};

/**
 * This signature of MockInstance lets customize the getter of a property.
 *
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 *
 * ```ts
 * MockInstance(ArbitraryComponent, 'currentUser$', () => mockUser$, 'get');
 * MockInstance(ArbitraryService, 'enabled', () => false, 'get');
 * ```
 */
export function MockInstance<T extends object, K extends keyof T, S extends () => T[K]>(
  instance: AnyType<T>,
  name: K,
  stub: S,
  encapsulation: 'get',
): S;

/**
 * This signature of MockInstance lets customize the setters of a property.
 *
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 *
 * ```ts
 * const currentUserSetterSpy = jasmine.createSpy();
 * MockInstance(ArbitraryComponent, 'currentUser', currentUserSetterSpy, 'set');
 *
 * let relServiceEnabled: boolean;
 * MockInstance(ArbitraryService, 'enabled', value => relServiceEnabled = value, 'set');
 * ```
 */
export function MockInstance<T extends object, K extends keyof T, S extends (value: T[K]) => void>(
  instance: AnyType<T>,
  name: K,
  stub: S,
  encapsulation: 'set',
): S;

/**
 * This signature of MockInstance lets customize the properties and methods.
 *
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 *
 * ```ts
 * MockInstance(ArbitraryComponent, 'onInit', onInitSpy);
 * MockInstance(ArbitraryDirective, 'onDestroy', () => {});
 * MockInstance(ArbitraryService, 'currentDate', new Date());
 * MockInstance(ArbitraryModule, 'currentUser', mockUser);
 * ```
 */
export function MockInstance<T extends object, K extends keyof T, S extends T[K]>(
  instance: AnyType<T>,
  name: K,
  stub: S,
): S;

/**
 * This signature of MockInstance lets customize tokens with a callback.
 *
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 *
 * ```ts
 * MockInstance(webSocketToken, () => mockWebSocket);
 * ```
 */
export function MockInstance<T>(
  declaration: InjectionToken<T>,
  init?: (instance: T | undefined, injector: Injector | undefined) => Partial<T> | Array<Partial<T>>,
): void;

/**
 * This signature of MockInstance lets customize tokens with a callback.
 *
 * @deprecated please pass the callback directly instead of config.
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 *
 * ```ts
 * MockInstance(webSocketToken, {
 *   init: () => mockWebSocket,
 * });
 * ```
 */
export function MockInstance<T>(
  declaration: InjectionToken<T>,
  config?: {
    init?: (instance: T | undefined, injector: Injector | undefined) => Partial<T> | Array<Partial<T>>;
  },
): void;

/**
 * This signature of MockInstance lets customize the instances of mock classes with a callback.
 * You can return a shape or change the instance.
 *
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 *
 * ```ts
 * MockInstance(ArbitraryComponent, (instance, injector) => {
 *   instance.enabled = true;
 *   instance.db = injector.get(DatabaseService);
 * });
 * MockInstance(ArbitraryDirective, () => {
 *   return {
 *     someProperty: true,
 *   };
 * });
 * ```
 */
export function MockInstance<T>(
  declaration: AnyType<T>,
  init?: (instance: T, injector: Injector | undefined) => void | Partial<T> | Array<Partial<T>>,
): void;

/**
 * This signature of MockInstance lets customize the instances of mock classes with a callback.
 * You can return a shape or change the instance.
 *
 * @deprecated please pass the callback directly instead of config.
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 *
 * ```ts
 * MockInstance(ArbitraryComponent, {
 *   init: (instance, injector) => {
 *     instance.enabled = true;
 *     instance.db = injector.get(DatabaseService);
 *   },
 * });
 * MockInstance(ArbitraryDirective, {
 *   init: () => {
 *     return {
 *       someProperty: true,
 *     };
 *   },
 * });
 * ```
 */
export function MockInstance<T>(
  declaration: AnyType<T>,
  config?: {
    init?: (instance: T, injector: Injector | undefined) => void | Partial<T> | Array<Partial<T>>;
  },
): void;

export function MockInstance<T>(declaration: AnyDeclaration<T>, ...args: any[]) {
  funcImportExists(declaration, 'MockInstance');

  if (args.length > 0) {
    const { key, value, accessor } = parseMockInstanceArgs(args);

    return mockInstanceConfig(declaration, key, value, accessor);
  }

  const config = ngMocksUniverse.configInstance.get(declaration) || /* istanbul ignore next */ {};

  ngMocksUniverse.configInstance.set(declaration, {
    ...config,
    overloads: [],
  });

  // When we are calling MockInstance without a config we need to reset it from the checks too.
  for (let i = checkReset.length - 1; i >= 0; i -= 1) {
    if (checkReset[i][0] === declaration && checkReset[i][2] === currentStack) {
      checkReset.splice(i, 1);
    }
  }
}

/**
 * Interface describes how to configure scopes for MockInstance.
 *
 * @see https://ng-mocks.sudo.eu/api/MockInstance#customization-scopes
 */
// istanbul ignore next: issue in istanbul https://github.com/istanbuljs/nyc/issues/1209
export namespace MockInstance {
  /**
   * Creates a scope which remembers all future customizations of MockInstance.
   * It allows to reset them afterwards.
   *
   * @see https://ng-mocks.sudo.eu/api/MockInstance#remember
   */
  export function remember() {
    ngMocksStack.stackPush();
  }

  /**
   * Resets all changes in the current scope.
   *
   * @see https://ng-mocks.sudo.eu/api/MockInstance#restore
   */
  export function restore() {
    ngMocksStack.stackPop();
  }

  /**
   * Creates a local scope in `beforeEach` and `afterEach`.
   * If `suite` has been passed, then `beforeAll` and `afterAll` are used.
   *
   * @see https://ng-mocks.sudo.eu/api/MockInstance#scope
   */
  export function scope(scope: 'all' | 'suite' | 'case' = 'case') {
    if (scope === 'all' || scope === 'suite') {
      beforeAll(MockInstance.remember);
      afterAll(MockInstance.restore);
    }
    if (scope === 'all' || scope === 'case') {
      beforeEach(MockInstance.remember);
      afterEach(MockInstance.restore);
    }
  }
}

/**
 * MockReset resets everything what has been configured in MockInstance.
 * Please consider using MockInstance.scope() instead,
 * which respects customizations between tests.
 *
 * https://ng-mocks.sudo.eu/api/MockInstance#resetting-customization
 * https://ng-mocks.sudo.eu/api/MockInstance#scope
 */
export function MockReset() {
  ngMocksUniverse.configInstance.clear();
}

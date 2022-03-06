// tslint:disable max-file-line-count

import { InjectionToken, Injector } from '@angular/core';

import { AbstractType, Type } from '../common/core.types';
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
    if (typeof set.value !== 'function') {
      set.value = set.value?.init;
    }
  }

  return set;
};

const checkReset: Array<[any, any, any?]> = [];
let checkCollect = false;

// istanbul ignore else: maybe a different runner is used
// tslint:disable-next-line strict-type-predicates
if (typeof beforeEach !== 'undefined') {
  beforeEach(() => (checkCollect = true));
  beforeEach(() => mockInstanceForgotReset(checkReset));
  afterEach(() => (checkCollect = false));
}

const mockInstanceConfig = <T>(
  declaration: Type<T> | AbstractType<T> | InjectionToken<T>,
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

export interface MockInstance {
  /**
   * Creates a bucket which remembers all future changes.
   *
   * @see https://ng-mocks.sudo.eu/api/MockInstance#remember
   */
  remember(): void;

  /**
   * Resets all changes for current bucket.
   *
   * @see https://ng-mocks.sudo.eu/api/MockInstance#restore
   */
  restore(): void;

  /**
   * Creates a local scope in `beforeAll` and `afterAll`.
   * If `each` has been passed, then `beforeEach` and `afterEach` are used.
   *
   * @see https://ng-mocks.sudo.eu/api/MockInstance#scope
   */
  scope(scope?: 'all'): void;
}

/**
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 */
export function MockInstance<T extends object, K extends keyof T, S extends () => T[K]>(
  instance: Type<T> | AbstractType<T>,
  name: K,
  stub: S,
  encapsulation: 'get',
): S;

/**
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 */
export function MockInstance<T extends object, K extends keyof T, S extends (value: T[K]) => void>(
  instance: Type<T> | AbstractType<T>,
  name: K,
  stub: S,
  encapsulation: 'set',
): S;

/**
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 */
export function MockInstance<T extends object, K extends keyof T, S extends T[K]>(
  instance: Type<T> | AbstractType<T>,
  name: K,
  stub: S,
): S;

/**
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 */
export function MockInstance<T>(
  declaration: InjectionToken<T>,
  init?: (instance: T | undefined, injector: Injector | undefined) => Partial<T>,
): void;

/**
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 */
export function MockInstance<T>(
  declaration: InjectionToken<T>,
  config?: {
    init?: (instance: T | undefined, injector: Injector | undefined) => Partial<T>;
  },
): void;

/**
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 */
export function MockInstance<T>(
  declaration: Type<T> | AbstractType<T>,
  init?: (instance: T, injector: Injector | undefined) => void | Partial<T>,
): void;

/**
 * @see https://ng-mocks.sudo.eu/api/MockInstance
 */
export function MockInstance<T>(
  declaration: Type<T> | AbstractType<T>,
  config?: {
    init?: (instance: T, injector: Injector | undefined) => void | Partial<T>;
  },
): void;

export function MockInstance<T>(declaration: Type<T> | AbstractType<T> | InjectionToken<T>, ...args: any[]) {
  funcImportExists(declaration, 'MockInstance');

  const { key, value, accessor } = parseMockInstanceArgs(args);

  if (value) {
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
 * @see https://ng-mocks.sudo.eu/api/MockInstance#remember
 */
MockInstance.remember = () => ngMocksStack.stackPush();

/**
 * @see https://ng-mocks.sudo.eu/api/MockInstance#restore
 */
MockInstance.restore = () => ngMocksStack.stackPop();

/**
 * @see https://ng-mocks.sudo.eu/api/MockInstance#scope
 */
MockInstance.scope = (scope: 'all' | 'suite' | 'case' = 'case') => {
  if (scope === 'all' || scope === 'suite') {
    beforeAll(MockInstance.remember);
    afterAll(MockInstance.restore);
  }
  if (scope === 'all' || scope === 'case') {
    beforeEach(MockInstance.remember);
    afterEach(MockInstance.restore);
  }
};

export function MockReset() {
  ngMocksUniverse.configInstance.clear();
}

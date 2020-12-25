import { InjectionToken, Injector } from '@angular/core';

import { AbstractType, Type } from '../common/core.types';
import ngMocksUniverse from '../common/ng-mocks-universe';

let installReporter = true;
const restore = (declaration: any, config: any): void => {
  if (installReporter) {
    jasmine.getEnv().addReporter(reporter);
    installReporter = false;
  }

  ngMocksUniverse.getLocalMocks().push([declaration, config]);
};

const reporter: jasmine.CustomReporter = {
  specDone: () => {
    const set = ngMocksUniverse.getLocalMocks();
    while (set.length) {
      const [declaration, config] = set.pop() || /* istanbul ignore next */ [];
      const universeConfig = ngMocksUniverse.config.has(declaration) ? ngMocksUniverse.config.get(declaration) : {};
      ngMocksUniverse.config.set(declaration, {
        ...universeConfig,
        ...config,
      });
    }
  },
  specStarted: () => {
    // On start we have to flush any caches,
    // they are not from this spec.
    const set = ngMocksUniverse.getLocalMocks();
    set.splice(0, set.length);
  },
};

/**
 * @see https://github.com/ike18t/ng-mocks#mockinstance
 */
export function MockInstance<T>(
  declaration: InjectionToken<T>,
  init?: (instance: T | undefined, injector: Injector | undefined) => Partial<T>,
): void;

/**
 * @see https://github.com/ike18t/ng-mocks#mockinstance
 */
export function MockInstance<T>(
  declaration: InjectionToken<T>,
  config?: {
    init?: (instance: T | undefined, injector: Injector | undefined) => Partial<T>;
  },
): void;

/**
 * @see https://github.com/ike18t/ng-mocks#mockinstance
 */
export function MockInstance<T>(
  declaration: Type<T> | AbstractType<T>,
  init?: (instance: T, injector: Injector | undefined) => void | Partial<T>,
): void;

/**
 * @see https://github.com/ike18t/ng-mocks#mockinstance
 */
export function MockInstance<T>(
  declaration: Type<T> | AbstractType<T>,
  config?: {
    init?: (instance: T, injector: Injector | undefined) => void | Partial<T>;
  },
): void;

export function MockInstance<T>(declaration: Type<T> | AbstractType<T> | InjectionToken<T>, data?: any) {
  const config = typeof data === 'function' ? { init: data } : data;
  const universeConfig = ngMocksUniverse.config.has(declaration) ? ngMocksUniverse.config.get(declaration) : {};
  restore(declaration, universeConfig);

  if (config) {
    ngMocksUniverse.config.set(declaration, {
      ...universeConfig,
      ...config,
    });
  } else {
    ngMocksUniverse.config.set(declaration, {
      ...universeConfig,
      init: undefined,
    });
  }
}

export function MockReset() {
  ngMocksUniverse.config.clear();
}

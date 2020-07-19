import { Injector } from '@angular/core';

import { AbstractType, Type } from '../common';
import { ngMocksUniverse } from '../common/ng-mocks-universe';

export function MockInstance<T>(
  declaration: Type<T> | AbstractType<T>,
  config?: {
    init?(instance: T, injector: Injector | undefined): void;
  }
) {
  const universeConfig = ngMocksUniverse.config.has(declaration) ? ngMocksUniverse.config.get(declaration) : {};
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

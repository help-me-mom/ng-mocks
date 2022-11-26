import { Injector, TemplateRef, ViewContainerRef } from '@angular/core';

import { MockConfig } from './mock';

export default <T>(
  value: T,
): value is T &
  MockConfig & {
    __ngMocksInjector?: Injector;
    __template?: TemplateRef<any>;
    __vcr?: ViewContainerRef;
  } => {
  return value && typeof value === 'object' && !!(value as any).__ngMocks;
};

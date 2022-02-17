import { Injector } from '@angular/core';

import { getTestBedInjection } from './core.helpers';

const defaultInjector: any = {};

export default (declaration: any, injector: Injector = defaultInjector): any => {
  if (injector === defaultInjector) {
    return getTestBedInjection(declaration);
  }
  try {
    return injector.get(declaration);
  } catch {
    return undefined;
  }
};

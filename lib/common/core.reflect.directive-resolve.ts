import { Directive } from '@angular/core';

import { directiveResolver } from './core.reflect';

export default (def: any): Directive => {
  try {
    return directiveResolver.resolve(def);
  } catch (e) {
    // istanbul ignore next
    throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
  }
};

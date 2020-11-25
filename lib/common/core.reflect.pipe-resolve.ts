import { Pipe } from '@angular/core';

import { pipeResolver } from './core.reflect';

export default (def: any): Pipe => {
  try {
    return pipeResolver.resolve(def);
  } catch (e) {
    // istanbul ignore next
    throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
  }
};

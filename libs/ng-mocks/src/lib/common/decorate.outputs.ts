import { Output } from '@angular/core';

import { AnyType } from './core.types';

// Looks like an A9 bug, that queries from @Component are not processed.
// Also we have to pass prototype, not the class.
// The same issue happens with outputs, but time to time
// (when I restart tests with refreshing browser manually).
// https://github.com/ike18t/ng-mocks/issues/109
export default (cls: AnyType<any>, outputs?: string[]) => {
  // istanbul ignore else
  if (outputs) {
    for (const output of outputs) {
      const [key, alias] = output.split(': ');
      Output(alias)(cls.prototype, key);
    }
  }
};

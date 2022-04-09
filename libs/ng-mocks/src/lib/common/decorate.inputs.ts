import { Input } from '@angular/core';

import { AnyType } from './core.types';

// Looks like an A9 bug, that queries from @Component are not processed.
// Also we have to pass prototype, not the class.
// The same issue happens with outputs, but time to time
// (when I restart tests with refreshing browser manually).
// https://github.com/ike18t/ng-mocks/issues/109
export default (cls: AnyType<any>, inputs?: string[], exclude?: string[]) => {
  // istanbul ignore else
  if (inputs) {
    for (const input of inputs) {
      const [key, alias] = input.split(': ');
      if (exclude && exclude.indexOf(key) !== -1) {
        continue;
      }
      Input(alias)(cls.prototype, key);
    }
  }
};

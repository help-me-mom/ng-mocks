import { Output } from '@angular/core';

import { AnyType, DirectiveIo } from './core.types';
import funcDirectiveIoBuild from './func.directive-io-build';
import funcDirectiveIoParse from './func.directive-io-parse';

// Looks like an A9 bug, that queries from @Component are not processed.
// Also, we have to pass prototype, not the class.
// The same issue happens with outputs, but time to time
// (when I restart tests with refreshing browser manually).
// https://github.com/help-me-mom/ng-mocks/issues/109
export default (cls: AnyType<any>, outputs?: Array<DirectiveIo>) => {
  // istanbul ignore else
  if (outputs) {
    for (const output of outputs) {
      const { name, alias, required } = funcDirectiveIoParse(output);
      Output(funcDirectiveIoBuild({ name, alias, required }, true) as never)(cls.prototype, name);
    }
  }
};

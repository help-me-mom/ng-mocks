import { DebugNode, Directive } from '@angular/core';

import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import funcGetProvider from '../common/func.get-provider';

const getMeta = (token: any): Directive | undefined => {
  try {
    return coreReflectDirectiveResolve(token);
  } catch (e) {
    // Looks like it is a token.
  }

  return undefined;
};

export default (el: DebugNode, token: any): Directive | undefined => {
  try {
    const provider = funcGetProvider(token);
    const instance = el.injector.get(provider);

    return getMeta(instance.constructor);
  } catch (e) {
    return undefined;
  }
};

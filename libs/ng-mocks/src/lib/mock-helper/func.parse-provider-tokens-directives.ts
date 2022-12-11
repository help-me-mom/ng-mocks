import { DebugNode, Directive } from '@angular/core';

import coreInjector from '../common/core.injector';
import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import funcGetType from '../common/func.get-type';

const getMeta = (token: any): Directive | undefined => {
  try {
    return coreReflectDirectiveResolve(token);
  } catch {
    return undefined;
  }
};

export default (el: DebugNode | null | undefined, token: any): Directive | undefined => {
  // istanbul ignore if
  if (!el) {
    return undefined;
  }

  try {
    const provider = funcGetType(token);
    const instance = coreInjector(provider, el.injector);

    return getMeta(instance.constructor);
  } catch {
    return undefined;
  }
};

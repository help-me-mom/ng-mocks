import { Directive } from '@angular/core';

import coreReflectDirectiveResolve from '../../common/core.reflect.directive-resolve';
import { isNgDef } from '../../common/func.is-ng-def';

export default (value: any): Directive | undefined => {
  if (isNgDef(value, 'c')) {
    return coreReflectDirectiveResolve(value);
  }
  if (isNgDef(value, 'd')) {
    return coreReflectDirectiveResolve(value);
  }

  return undefined;
};

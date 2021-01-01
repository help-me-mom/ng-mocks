import { Directive } from '@angular/core';

import coreReflectDirective from '../../common/core.reflect.directive';
import { isNgDef } from '../../common/func.is-ng-def';

export default (value: any): Directive | undefined => {
  if (isNgDef(value, 'c')) {
    return coreReflectDirective().resolve(value);
  }
  if (isNgDef(value, 'd')) {
    return coreReflectDirective().resolve(value);
  }

  return undefined;
};

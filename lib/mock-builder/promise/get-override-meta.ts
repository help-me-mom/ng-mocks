import { Directive } from '@angular/core';

import { directiveResolver } from '../../common/core.reflect';
import { isNgDef } from '../../common/func.is-ng-def';

export default (value: any): Directive | undefined => {
  if (isNgDef(value, 'c')) {
    return directiveResolver.resolve(value);
  }
  if (isNgDef(value, 'd')) {
    return directiveResolver.resolve(value);
  }

  return undefined;
};

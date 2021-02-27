import { DebugNode } from '@angular/core';

import coreForm from '../../common/core.form';
import coreInjector from '../../common/core.injector';

export default (el: DebugNode): Record<keyof any, any> => {
  const ngControl = coreForm && coreInjector(coreForm.NgControl, el.injector);
  const valueAccessor = ngControl?.valueAccessor;
  if (!valueAccessor) {
    throw new Error('Cannot find ControlValueAccessor on the element');
  }

  return valueAccessor;
};

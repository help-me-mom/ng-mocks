import { DebugNode } from '@angular/core';

import coreForm from '../../common/core.form';
import coreInjector from '../../common/core.injector';

export default (el: DebugNode): Record<keyof any, any> => {
  const ngControl = coreForm && coreInjector(coreForm.NgControl, el.injector);
  const valueAccessor = ngControl?.valueAccessor;
  if (valueAccessor) {
    return valueAccessor;
  }

  const formControlDirective = coreForm && coreInjector(coreForm.FormControlDirective, el.injector);
  if (formControlDirective?.form) {
    return formControlDirective.form;
  }

  const ngModel = coreForm && coreInjector(coreForm.NgModel, el.injector);
  if (ngModel) {
    return ngModel;
  }

  throw new Error('Cannot find ControlValueAccessor on the element');
};

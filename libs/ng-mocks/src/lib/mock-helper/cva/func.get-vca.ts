import { DebugNode } from '@angular/core';

import coreForm from '../../common/core.form';
import coreInjector from '../../common/core.injector';

const message = [
  'Cannot find ControlValueAccessor on the element.',
  'If it is a mock input with [formControlName],',
  'you need either to avoid mocking ReactiveFormsModule',
  'or to avoid accessing the control in such a way,',
  'because this tests ReactiveFormsModule instead of own implementation.',
].join(' ');

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

  throw new Error(message);
};

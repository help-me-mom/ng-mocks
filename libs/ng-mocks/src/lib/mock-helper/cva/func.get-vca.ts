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

export default (el: DebugNode, optional = false): Record<keyof any, any> | undefined => {
  const ngControl =
    coreForm && el.providerTokens.indexOf(coreForm.NgControl) !== -1 && coreInjector(coreForm.NgControl, el.injector);
  const valueAccessor = ngControl?.valueAccessor;
  if (valueAccessor) {
    return valueAccessor;
  }

  // A signal field can expose NgControl without a CVA. Its ancestors' legacy controls
  // must not be used as fallbacks for that field.
  const formControlDirective =
    coreForm &&
    el.providerTokens.indexOf(coreForm.FormControlDirective) !== -1 &&
    coreInjector(coreForm.FormControlDirective, el.injector);
  if (formControlDirective?.form) {
    return formControlDirective.form;
  }

  const ngModel =
    coreForm && el.providerTokens.indexOf(coreForm.NgModel) !== -1 && coreInjector(coreForm.NgModel, el.injector);
  if (ngModel) {
    return ngModel;
  }

  const valueAccessors =
    coreForm &&
    ngControl &&
    el.providerTokens.indexOf(coreForm.NG_VALUE_ACCESSOR) !== -1 &&
    coreInjector(coreForm.NG_VALUE_ACCESSOR, el.injector);
  if (valueAccessors?.length) {
    // Match signal forms: Angular 22 selects custom/built-in/default accessors,
    // while Angular 21 uses the first provider.
    return coreForm.selectValueAccessor ? coreForm.selectValueAccessor(ngControl, valueAccessors) : valueAccessors[0];
  }

  if (optional) {
    return undefined;
  }

  throw new Error(message);
};

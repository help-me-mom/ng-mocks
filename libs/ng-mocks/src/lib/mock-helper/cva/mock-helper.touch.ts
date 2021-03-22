import { DebugElement } from '@angular/core';

import coreForm from '../../common/core.form';
import { isMockControlValueAccessor } from '../../common/func.is-mock-control-value-accessor';

import funcGetVca from './func.get-vca';

// default html behavior
const triggerTouch = (el: DebugElement): void => {
  const target = el.nativeElement;
  el.triggerEventHandler('focus', {
    target,
  });

  el.triggerEventHandler('blur', {
    target,
  });
};

const handleKnown = (valueAccessor: any): boolean => {
  if (coreForm && valueAccessor instanceof coreForm.AbstractControl) {
    valueAccessor.markAsTouched();

    return true;
  }

  if (isMockControlValueAccessor(valueAccessor.instance)) {
    valueAccessor.instance.__simulateTouch();

    return true;
  }

  return false;
};

const keys = ['onTouched', '_onTouched', '_cvaOnTouch', '_markAsTouched', '_onTouchedCallback', 'onModelTouched'];

export default (el: DebugElement): void => {
  const valueAccessor = funcGetVca(el);
  if (handleKnown(valueAccessor)) {
    triggerTouch(el);

    return;
  }

  for (const key of keys) {
    if (typeof valueAccessor[key] === 'function') {
      triggerTouch(el);
      // valueAccessor[key]();

      return;
    }
  }

  throw new Error('Unsupported type of ControlValueAccessor');
};

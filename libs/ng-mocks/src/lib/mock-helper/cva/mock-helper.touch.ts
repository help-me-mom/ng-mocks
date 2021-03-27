import { DebugElement } from '@angular/core';

import coreForm from '../../common/core.form';
import { isMockControlValueAccessor } from '../../common/func.is-mock-control-value-accessor';
import mockHelperTrigger from '../events/mock-helper.trigger';

import funcGetVca from './func.get-vca';

// default html behavior
const triggerTouch = (el: DebugElement): void => {
  mockHelperTrigger(el, 'focus');
  mockHelperTrigger(el, 'blur');
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

const hasListener = (el: DebugElement): boolean =>
  el.listeners.filter(listener => listener.name === 'focus' || listener.name === 'blur').length > 0;

const keys = ['onTouched', '_onTouched', '_cvaOnTouch', '_markAsTouched', '_onTouchedCallback', 'onModelTouched'];

export default (el: DebugElement): void => {
  const valueAccessor = funcGetVca(el);
  if (handleKnown(valueAccessor) || hasListener(el)) {
    triggerTouch(el);

    return;
  }

  for (const key of keys) {
    if (typeof valueAccessor[key] === 'function') {
      valueAccessor[key]();

      return;
    }
  }

  throw new Error('Unsupported type of ControlValueAccessor');
};

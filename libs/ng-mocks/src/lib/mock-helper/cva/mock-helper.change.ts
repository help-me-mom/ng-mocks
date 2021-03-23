import { DebugElement } from '@angular/core';

import coreForm from '../../common/core.form';
import { isMockControlValueAccessor } from '../../common/func.is-mock-control-value-accessor';
import mockHelperStubMember from '../mock-helper.stub-member';

import funcGetVca from './func.get-vca';

// default html behavior
const triggerInput = (el: DebugElement, value: any): void => {
  const target = el.nativeElement;
  el.triggerEventHandler('focus', {
    target,
  });

  const descriptor = Object.getOwnPropertyDescriptor(target, 'value');
  mockHelperStubMember(target, 'value', value);
  el.triggerEventHandler('input', {
    target,
  });
  if (descriptor) {
    Object.defineProperty(target, 'value', descriptor);
    target.value = value;
  }

  el.triggerEventHandler('blur', {
    target,
  });
};

const handleKnown = (valueAccessor: any, value: any): boolean => {
  if (coreForm && valueAccessor instanceof coreForm.AbstractControl) {
    valueAccessor.setValue(value);

    return true;
  }

  if (coreForm && valueAccessor instanceof coreForm.NgModel) {
    valueAccessor.update.emit(value);

    return true;
  }

  if (isMockControlValueAccessor(valueAccessor.instance)) {
    valueAccessor.instance.__simulateChange(value);

    return true;
  }

  return false;
};

const hasListener = (el: DebugElement): boolean =>
  el.listeners.filter(listener => listener.name === 'input').length > 0;

const keys = ['onChange', '_onChange', 'changeFn', '_onChangeCallback', 'onModelChange'];

export default (el: DebugElement, value: any): void => {
  const valueAccessor = funcGetVca(el);
  if (handleKnown(valueAccessor, value) || hasListener(el)) {
    triggerInput(el, value);

    return;
  }

  for (const key of keys) {
    if (typeof valueAccessor[key] === 'function') {
      valueAccessor.writeValue(value);
      valueAccessor[key](value);

      return;
    }
  }

  throw new Error('Unsupported type of ControlValueAccessor');
};

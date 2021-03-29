import { DebugElement } from '@angular/core';

import coreForm from '../../common/core.form';
import { isMockControlValueAccessor } from '../../common/func.is-mock-control-value-accessor';
import mockHelperTrigger from '../events/mock-helper.trigger';
import mockHelperStubMember from '../mock-helper.stub-member';

import funcGetVca from './func.get-vca';

// default html behavior
const triggerInput = (el: DebugElement, value: any): void => {
  mockHelperTrigger(el, 'focus');

  const descriptor = Object.getOwnPropertyDescriptor(el.nativeElement, 'value');
  mockHelperStubMember(el.nativeElement, 'value', value);
  mockHelperTrigger(el, 'input');
  mockHelperTrigger(el, 'change');
  if (descriptor) {
    Object.defineProperty(el.nativeElement, 'value', descriptor);
    el.nativeElement.value = value;
  }

  mockHelperTrigger(el, 'blur');
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
  el.listeners.filter(listener => listener.name === 'input' || listener.name === 'change').length > 0;

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

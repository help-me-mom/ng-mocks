import { DebugElement } from '@angular/core';

import { isMockControlValueAccessor } from '../../common/func.is-mock-control-value-accessor';

import funcGetVca from './func.get-vca';

// default html behavior
const triggerInput = (el: DebugElement, value: any): void => {
  el.triggerEventHandler('focus', {});
  el.nativeElement.value = value;
  el.triggerEventHandler('input', {
    target: {
      value,
    },
  });
  el.triggerEventHandler('blur', {});
};

export default (el: DebugElement, value: any): void => {
  const valueAccessor = funcGetVca(el);
  if (isMockControlValueAccessor(valueAccessor.instance)) {
    valueAccessor.instance.__simulateChange(value);

    return;
  }

  triggerInput(el, value);
  for (const key of ['onChange', '_onChange', 'changeFn', '_onChangeCallback', 'onModelChange']) {
    if (typeof valueAccessor[key] === 'function') {
      valueAccessor[key](value);

      return;
    }
  }

  throw new Error('Unsupported type of ControlValueAccessor');
};

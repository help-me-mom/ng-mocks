import { DebugNode } from '@angular/core';

import { isMockControlValueAccessor } from '../../common/func.is-mock-control-value-accessor';

import funcGetVca from './func.get-vca';

export default (el: DebugNode): void => {
  const valueAccessor = funcGetVca(el);
  if (isMockControlValueAccessor(valueAccessor.instance)) {
    valueAccessor.instance.__simulateTouch();

    return;
  }

  for (const key of [
    'onTouched',
    '_onTouched',
    '_cvaOnTouch',
    '_markAsTouched',
    '_onTouchedCallback',
    'onModelTouched',
  ]) {
    if (typeof valueAccessor[key] === 'function') {
      valueAccessor[key]();

      return;
    }
  }

  throw new Error('Unsupported type of ControlValueAccessor');
};

import { DebugNode } from '@angular/core';

import { isMockControlValueAccessor } from '../../common/func.is-mock-control-value-accessor';

import funcGetVca from './func.get-vca';

export default (el: DebugNode, value: any): void => {
  const valueAccessor = funcGetVca(el);
  if (isMockControlValueAccessor(valueAccessor.instance)) {
    valueAccessor.instance.__simulateChange(value);

    return;
  }

  for (const key of ['onChange', '_onChange', 'changeFn', '_onChangeCallback', 'onModelChange']) {
    if (typeof valueAccessor[key] === 'function') {
      valueAccessor[key](value);

      return;
    }
  }

  throw new Error('Unsupported type of ControlValueAccessor');
};

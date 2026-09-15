import { DebugElement } from '@angular/core';

import { isMockControlValueAccessor } from '../../common/func.is-mock-control-value-accessor';
import { MockControlValueAccessorProxy } from '../../common/mock-control-value-accessor-proxy';

import funcGetVca from './func.get-vca';

export default (el: DebugElement): boolean => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.nativeNode.tagName) === -1) {
    return false;
  }

  // Disconnected native mocks still support DOM events, without a forms callback.
  const accessor = funcGetVca(el, true);

  return accessor instanceof MockControlValueAccessorProxy && isMockControlValueAccessor(accessor.instance);
};

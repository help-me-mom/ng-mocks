import { DebugNode } from '@angular/core';

import { Type } from '../common/core.types';

import { Node } from './func.get-from-node';

export default <T>(result: T[], node: (DebugNode & Node) | null | undefined, proto: Type<T>): void => {
  if (!node) {
    return;
  }

  try {
    const instance = node.injector.get(proto);
    if (result.indexOf(instance) === -1) {
      result.push(instance);
    }
  } catch (error) {
    // nothing to do
  }
};

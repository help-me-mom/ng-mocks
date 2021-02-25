import { DebugNode } from '@angular/core';

import coreInjector from '../common/core.injector';
import { Type } from '../common/core.types';

import { Node } from './func.get-from-node';

export default <T>(result: T[], node: (DebugNode & Node) | null | undefined, proto: Type<T>): void => {
  if (!node) {
    return;
  }

  const instance = coreInjector(proto, node.injector);
  if (instance && result.indexOf(instance) === -1) {
    result.push(instance);
  }
};

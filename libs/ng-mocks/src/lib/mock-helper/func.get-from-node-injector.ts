import { DebugNode, InjectionToken, Injector } from '@angular/core';

import coreInjector from '../common/core.injector';
import { Type } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';

import { Node } from './func.get-from-node';

const getParentWithInjector = (node: (DebugNode & Node) | null): Injector | undefined => {
  let parent: DebugNode | null = node;
  while (parent?.injector.constructor.name === 'NullInjector') {
    parent = parent.parent;
  }

  if (parent) {
    return parent.injector;
  }

  return undefined;
};

export default <T>(result: T[], node: DebugNode & Node, proto: Type<T> | InjectionToken<T>): void => {
  if (!node.injector || node.injector.constructor.name === 'NullInjector') {
    return;
  }

  const parentInjector = getParentWithInjector(node.parent);
  const parentInstance = parentInjector ? coreInjector(proto, parentInjector) : undefined;
  const instance = coreInjector(proto, node.injector);
  // a way to avoid inherited injections
  if (parentInstance === instance) {
    return;
  }

  if (isNgDef(proto, 't') && instance !== undefined) {
    result.push(instance);
  } else if (instance !== undefined && result.indexOf(instance) === -1) {
    result.push(instance);
  }
};

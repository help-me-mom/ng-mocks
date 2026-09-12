import { DebugNode, Injector } from '@angular/core';

import coreInjector from '../common/core.injector';
import { AnyDeclaration } from '../common/core.types';
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

export default <T>(result: T[], node: DebugNode & Node, proto: AnyDeclaration<T>): void => {
  if (!node.injector || node.injector.constructor.name === 'NullInjector') {
    return;
  }

  // Resolve the requested provider before optional parent probes can consume its error.
  const notFoundValue = {};
  // Pipes found in views can require a node-specific ChangeDetectorRef. Their
  // unrelated module provider is only a fallback probe, as in issue-4344.
  const value =
    isNgDef(proto, 'p') && (!node.providerTokens || node.providerTokens.indexOf(proto) === -1)
      ? coreInjector(proto, node.injector)
      : node.injector.get(proto, notFoundValue);
  const instance = value === notFoundValue ? undefined : value;
  const parentInjector = getParentWithInjector(node.parent);
  const parentInstance = parentInjector ? coreInjector(proto, parentInjector) : undefined;
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

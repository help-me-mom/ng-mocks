import { DebugNode } from '@angular/core';

import { AnyType } from '../common/core.types';

import { Node } from './func.get-from-node';
import funcGetFromNodeElement from './func.get-from-node-element';
import funcGetFromNodeScan from './func.get-from-node-scan';

const normalize = (item: any): any => {
  if (!item || typeof item !== 'object') {
    return item;
  }

  for (const key of ['renderElement', 'renderText', 'instance']) {
    if (item[key]) {
      return item[key];
    }
  }

  return null;
};

export default <T>(result: T[], node: (DebugNode & Node) | null | undefined, proto: AnyType<T>): void => {
  if (!node || !node._debugContext) {
    return;
  }

  const el = funcGetFromNodeElement(node);

  funcGetFromNodeScan(
    {
      el,
      nodes: node._debugContext.view.nodes,
      normalize,
      proto,
      result,
    },
    true,
  );
};

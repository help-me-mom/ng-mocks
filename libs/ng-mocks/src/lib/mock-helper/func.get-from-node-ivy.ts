import { DebugNode } from '@angular/core';

import { Type } from '../common/core.types';

import { Node } from './func.get-from-node';
import funcGetFromNodeElement from './func.get-from-node-element';
import funcGetFromNodeScan from './func.get-from-node-scan';

const detectContext = (node: DebugNode): any => {
  let current = node;
  let context = current.nativeNode.__ngContext__;
  while (!context && current.parent) {
    current = current.parent;
    context = current.nativeNode.__ngContext__;
  }

  return context;
};

const contextToNodes = (context: any): any => (Array.isArray(context) ? context : context?.lView);

export default <T>(result: T[], node: DebugNode & Node, proto: Type<T>): void => {
  if (!node || node._debugContext) {
    return;
  }

  const el = funcGetFromNodeElement(node);

  funcGetFromNodeScan(
    {
      el,
      nodes: contextToNodes(detectContext(node)) || [],
      normalize: item => item,
      proto,
      result,
    },
    true,
  );
};

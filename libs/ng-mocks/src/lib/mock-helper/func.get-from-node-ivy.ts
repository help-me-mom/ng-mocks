import { DebugNode } from '@angular/core';

import { AnyType } from '../common/core.types';

import { Node } from './func.get-from-node';
import funcGetFromNodeElement from './func.get-from-node-element';
import funcGetFromNodeScan from './func.get-from-node-scan';

const detectContextByIndex = (rootView: any, index: number) => {
  if (typeof rootView[1] === 'object' && rootView[20] === index) {
    return rootView;
  }

  for (let i = 21; i < rootView.length; i += 1) {
    const item = rootView[i];
    if (Array.isArray(item) && typeof item[1] === 'object' && item[20] === index) {
      return item;
    }
  }

  return undefined;
};

const detectContext = (node: DebugNode): any => {
  let current = node;
  let context = current.nativeNode?.__ngContext__;
  while (context === undefined && current.parent) {
    current = current.parent;
    context = current.nativeNode.__ngContext__;
  }
  if (typeof context !== 'number') {
    return context;
  }
  // welcome to A12 and its optimization
  // https://github.com/angular/angular/pull/41358

  const rootView = (current.injector as any)._lView;
  if (Array.isArray(rootView)) {
    return detectContextByIndex(rootView, context);
  }

  return undefined;
};

const contextToNodes = (context: any): any => (Array.isArray(context) ? context : context?.lView);

export default <T>(result: T[], node: (DebugNode & Node) | null | undefined, proto: AnyType<T>): void => {
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

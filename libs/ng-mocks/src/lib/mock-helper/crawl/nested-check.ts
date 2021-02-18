import { DebugElement } from '@angular/core';

import { MockedDebugNode } from '../../mock-render/types';

import detectTextNode from './detect-text-node';

interface ElDef {
  nodeIndex: number;
  parent: null | ElDef;
}

interface DebugNode {
  childNodes?: DebugNode[];
  injector?: {
    elDef?: ElDef;
  };
  parent: null | DebugNode;
}

const isDebugNode = (value: unknown): value is DebugElement & DebugNode => {
  return !!value && typeof value === 'object';
};

// normal and ivy
const getNodeElDef = (node: any) => {
  return node.injector.elDef || node.injector._tNode || undefined;
};

const getParentElDef = (node: any) => {
  return detectTextNode(node) ? undefined : node.injector.elDef?.parent || node.injector._tNode?.parent;
};

const getElDef = (node: any): [any, any] => {
  return [getNodeElDef(node), getParentElDef(node)];
};

const nestedCheck = (node: MockedDebugNode | undefined, check: (node: MockedDebugNode) => void | boolean): boolean => {
  if (!isDebugNode(node)) {
    return false;
  }
  if (check(node)) {
    return true;
  }

  const [elDef, elDefParent] = getElDef(node);
  for (const childNode of node.childNodes || (elDefParent && node.parent?.childNodes) || []) {
    const childNodeParent = getParentElDef(childNode);
    if (childNodeParent && childNodeParent !== elDef) {
      continue;
    }
    if (nestedCheck(childNode, check)) {
      return true;
    }
  }

  return false;
};

export default ((): typeof nestedCheck => nestedCheck)();

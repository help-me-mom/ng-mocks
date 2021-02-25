import { MockedDebugNode } from '../../mock-render/types';

import detectTextNode from './detect-text-node';
import elDefCompare from './el-def-compare';
import elDefGetNode from './el-def-get-node';
import elDefGetParent from './el-def-get-parent';
import nestedCheckChildren from './nested-check-children';

const detectParent = (node: MockedDebugNode, parent: MockedDebugNode | undefined): MockedDebugNode | undefined => {
  if (parent) {
    return parent;
  }

  const expected = elDefGetParent(node);
  const currentParent = node.parent ? elDefGetNode(node.parent) : undefined;
  if (node.parent && elDefCompare(expected, currentParent)) {
    return node.parent;
  }
  for (const childNode of node.parent?.childNodes || []) {
    const childElDef = elDefGetNode(childNode);
    if (elDefCompare(expected, childElDef)) {
      return childNode;
    }
  }

  return undefined;
};

const nestedCheck = (
  node: MockedDebugNode | undefined,
  parent: MockedDebugNode | undefined,
  check: (node: MockedDebugNode, parent?: MockedDebugNode) => void | boolean,
  includeTextNode = false,
): boolean => {
  if (!node) {
    return false;
  }
  if (!includeTextNode && detectTextNode(node)) {
    return false;
  }
  if (check(node, detectParent(node, parent))) {
    return true;
  }

  for (const childNode of nestedCheckChildren(node)) {
    if (nestedCheck(childNode, node, check, includeTextNode)) {
      return true;
    }
  }

  return false;
};

export default ((): typeof nestedCheck => nestedCheck)();

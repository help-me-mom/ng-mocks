import { MockedDebugNode } from '../../mock-render/types';

import elDefCompare from './el-def-compare';
import elDefGetNode from './el-def-get-node';
import elDefGetParent from './el-def-get-parent';

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

export default ((): typeof detectParent => detectParent)();

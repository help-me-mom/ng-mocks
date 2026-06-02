import { MockedDebugNode } from '../../mock-render/types';

import detectTextNode from './detect-text-node';
import nestedCheckChildren from './nested-check-children';
import nestedCheckParent from './nested-check-parent';

const nestedCheck = (
  node: MockedDebugNode | null | undefined,
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
  if (check(node, nestedCheckParent(node, parent))) {
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

import { MockedDebugNode } from '../../mock-render/types';

import detectTextNode from './detect-text-node';
import elDefCompare from './el-def-compare';
import elDefGetNode from './el-def-get-node';
import elDefGetParent from './el-def-get-parent';

export default (node: MockedDebugNode): MockedDebugNode[] => {
  const elDef = elDefGetNode(node);
  if (!elDef || detectTextNode(node)) {
    return [];
  }

  const isDirect = (node as any).childNodes !== undefined;
  const children: MockedDebugNode[] = [];
  for (const childNode of (node as any).childNodes || node.parent?.childNodes || []) {
    const childNodeParent = elDefGetParent(childNode);

    if (!isDirect && !elDefCompare(elDef, childNodeParent)) {
      continue;
    }
    if (childNodeParent && !elDefCompare(elDef, childNodeParent)) {
      continue;
    }

    children.push(childNode);
  }
  if ((node as any).name === '#host' && (node as any).parent) {
    let add = false;
    for (const childNode of (node as any).parent.childNodes) {
      if (childNode.nativeNode === node.nativeNode) {
        add = true;
        continue;
      }
      if (add && childNode.name === '#host') {
        children.push(childNode);
      } else if (add && !childNode.name) {
        break;
      }
    }
  }

  return children;
};

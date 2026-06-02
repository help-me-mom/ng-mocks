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

  if ((node as any).parent?.name === 'BODY') {
    const childNodes: any[] = (node as any).parent.childNodes;
    let start = childNodes.length;
    let end = 0;
    for (let i = childNodes.length - 1; i >= 0; i -= 1) {
      const childNode = childNodes[i];
      if (childNode.nativeNode.nodeName === '#comment') {
        end = i;
      } else if (childNode.nativeNode === node.nativeNode) {
        start = i + 1;
        break;
      }
    }
    for (let i = start; i < end; i += 1) {
      children.push(childNodes[i]);
    }
  }

  return children;
};

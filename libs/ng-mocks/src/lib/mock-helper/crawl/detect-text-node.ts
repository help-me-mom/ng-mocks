import type { MockedDebugNode } from '../../mock-render/types.common';

export default (node: MockedDebugNode): boolean => {
  return node.nativeNode.nodeName === '#text';
};

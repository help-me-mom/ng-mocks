import { MockedDebugNode } from '../../mock-render/types';

export default (node: MockedDebugNode): boolean => {
  return node.nativeNode.nodeName === '#text';
};

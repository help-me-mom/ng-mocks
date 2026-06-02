import type { MockedDebugNode } from '../../mock-render/types.common';

export default (id: string): ((node: MockedDebugNode) => boolean) =>
  node => {
    return !!node.references[id];
  };

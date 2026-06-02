import { MockedDebugNode } from '../../mock-render/types';

export default (id: string): ((node: MockedDebugNode) => boolean) =>
  node => {
    return !!node.references[id];
  };

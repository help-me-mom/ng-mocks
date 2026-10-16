import { MockedDebugNode } from '../../mock-render/types';

export default (id: string): ((node: MockedDebugNode) => boolean) =>
  node => {
    const references = node.references;

    return Object.prototype.hasOwnProperty.call(references, id) && !!references[id];
  };

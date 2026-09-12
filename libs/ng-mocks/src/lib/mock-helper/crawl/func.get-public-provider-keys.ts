import { MockedDebugNode } from '../../mock-render/types';

export default (node: MockedDebugNode): string[] => {
  const elDef = (node.injector as { elDef?: { element: { publicProviders: Record<string, { parent: unknown }> } } })
    .elDef;

  // View Engine shares ancestor provider maps with elements that declare no providers.
  return elDef
    ? Object.keys(elDef.element.publicProviders).filter(key => elDef.element.publicProviders[key].parent === elDef)
    : [];
};

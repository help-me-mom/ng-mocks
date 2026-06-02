import type { MockedDebugNode } from '../../mock-render/types.common';

export default (node: MockedDebugNode): string[] => {
  return (node.injector as any).elDef ? Object.keys((node.injector as any).elDef.element.publicProviders) : [];
};

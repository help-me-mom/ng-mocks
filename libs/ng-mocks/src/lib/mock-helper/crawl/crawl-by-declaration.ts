import coreInjector from '../../common/core.injector';
import { AnyType } from '../../common/core.types';
import { getSourceOfMock } from '../../common/func.get-source-of-mock';
import type { MockedDebugNode } from '../../mock-render/types.common';

export default (declaration: AnyType<any>): ((node: MockedDebugNode) => boolean) => {
  const source = getSourceOfMock(declaration);

  return node =>
    !!node && node.providerTokens.indexOf(source) !== -1 && coreInjector(source, node.injector) !== undefined;
};

import { AnyType } from '../../common/core.types';
import { getSourceOfMock } from '../../common/func.get-source-of-mock';
import { MockedDebugNode } from '../../mock-render/types';

export default (declaration: AnyType<any>): ((node: MockedDebugNode) => boolean) => {
  const source = getSourceOfMock(declaration);

  return node => !!node && node.providerTokens.indexOf(source) !== -1 && !!node.injector.get(source, null);
};

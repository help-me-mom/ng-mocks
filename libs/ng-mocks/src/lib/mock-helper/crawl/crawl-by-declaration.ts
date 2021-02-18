import { AnyType } from '../../common/core.types';
import { getSourceOfMock } from '../../common/func.get-source-of-mock';
import { MockedDebugNode } from '../../mock-render/types';

export default (declaration: AnyType<any>): ((node: MockedDebugNode) => boolean) => {
  const source = getSourceOfMock(declaration);

  return node => {
    try {
      if (node.providerTokens.indexOf(source) === -1) {
        return false;
      }
      node.injector.get(source);

      return true;
    } catch (e) {
      // nothing to do.
    }

    return false;
  };
};

import { Type } from '../common/core.types';
import { getSourceOfMock } from '../common/func.get-source-of-mock';
import { MockedDebugNode } from '../mock-render/types';

function nestedCheck<T>(
  result: T[],
  node: MockedDebugNode & { childNodes?: MockedDebugNode[] },
  callback: (node: MockedDebugNode) => undefined | T
) {
  const element = callback(node);
  if (element) {
    result.push(element);
  }
  const childNodes = node.childNodes ? node.childNodes : [];
  childNodes.forEach(childNode => {
    nestedCheck(result, childNode, callback);
  });
}

export default <T>(el: MockedDebugNode, sel: Type<T>): T[] => {
  const result: T[] = [];
  nestedCheck<T>(result, el, node => {
    try {
      return node.injector.get(getSourceOfMock(sel));
    } catch (error) {
      return undefined;
    }
  });
  return result;
};

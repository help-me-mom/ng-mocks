import { Type } from '../common/core.types';
import { getSourceOfMock } from '../common/func.get-source-of-mock';
import { MockedDebugElement } from '../mock-render/types';

const defaultNotFoundValue = {}; // simulating Symbol

export default <T>(...args: any[]) => {
  const el: MockedDebugElement = args[0];
  const sel: Type<T> = args[1];
  const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;

  // Looking for related attribute directive.
  try {
    return el.injector.get(getSourceOfMock(sel));
  } catch (error) {
    // looks like the directive is structural.
  }

  // Looking for related structural directive.
  // It's located as prev node.
  const prevNode = el.nativeNode.previousSibling;
  const matches =
    !prevNode || prevNode.nodeName !== '#comment' || !el || !el.parent
      ? []
      : el.parent.queryAllNodes(node => node.nativeNode === prevNode);
  const matchedNode = matches[0];
  try {
    return matchedNode.injector.get(getSourceOfMock(sel));
  } catch (error) {
    // nothing to do
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find ${sel.name} directive via ngMocks.get`);
};

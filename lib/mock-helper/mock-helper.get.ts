import { Type } from '../common/core.types';
import { getSourceOfMock } from '../common/func.get-source-of-mock';
import { MockedDebugElement } from '../mock-render/types';

const defaultNotFoundValue = {}; // simulating Symbol

export default <T>(...args: any[]) => {
  const el: MockedDebugElement = args[0];
  const sel: Type<T> = args[1];
  const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;
  let notFound = false;

  // Looking for related attribute directive.
  try {
    return el.injector.get(getSourceOfMock(sel));
  } catch (error) {
    // looks like the directive is structural.
  }

  // Looking for related structural directive.
  // It's located as prev node.
  const prevNode = el.nativeNode.previousSibling;
  if (!prevNode || prevNode.nodeName !== '#comment') {
    notFound = true;
  }
  const matches = notFound || !el || !el.parent ? [] : el.parent.queryAllNodes(node => node.nativeNode === prevNode);
  if (matches.length === 0) {
    notFound = true;
  }
  const matchedNode = matches[0];
  try {
    return matchedNode.injector.get(getSourceOfMock(sel));
  } catch (error) {
    notFound = true;
  }
  if (notFound && notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find ${sel.name} directive via ngMocks.get`);
};

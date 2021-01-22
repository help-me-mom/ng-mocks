import { Type } from '../common/core.types';
import { getSourceOfMock } from '../common/func.get-source-of-mock';
import { MockedDebugElement } from '../mock-render/types';

import funcGetFromNode from './func.get-from-node';

const defaultNotFoundValue = {}; // simulating Symbol

const parseArgs = <T>(
  args: any[],
): {
  el: MockedDebugElement;
  notFoundValue: any;
  sel: Type<T>;
} => ({
  el: args[0],
  notFoundValue: args.length === 3 ? args[2] : defaultNotFoundValue,
  sel: args[1],
});

export default <T>(...args: any[]) => {
  const { el, sel, notFoundValue } = parseArgs<T>(args);

  const res1 = funcGetFromNode([], el, getSourceOfMock(sel));
  if (res1.length) {
    return res1[0];
  }

  // Looking for related structural directive.
  const prevNode = el.nativeNode.previousSibling;
  const matches =
    !prevNode || prevNode.nodeName !== '#comment' || !el || !el.parent
      ? []
      : el.parent.queryAllNodes(node => node.nativeNode === prevNode);
  const matchedNode = matches[0];
  const res2 = funcGetFromNode([], matchedNode, getSourceOfMock(sel));
  if (res2.length) {
    return res2[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find ${sel.name} instance via ngMocks.get`);
};

import { Type } from '../common/core.types';
import { getSourceOfMock } from '../common/func.get-source-of-mock';
import { MockedDebugElement } from '../mock-render/types';

import mockHelperFind from './find/mock-helper.find';
import funcGetFromNode from './func.get-from-node';
import funcGetLastFixture from './func.get-last-fixture';

const defaultNotFoundValue = {}; // simulating Symbol

const parseArgs = <T>(
  args: any[],
): {
  el: MockedDebugElement | null | undefined;
  notFoundValue: any;
  sel: Type<T>;
} => ({
  el: args[0],
  notFoundValue: args.length === 3 ? args[2] : defaultNotFoundValue,
  sel: args[1],
});

export default <T>(...args: any[]) => {
  const { el, sel, notFoundValue } = parseArgs<T>(args);
  const root = mockHelperFind(funcGetLastFixture(), el, undefined);

  const res1 = funcGetFromNode([], root, getSourceOfMock(sel));
  if (res1.length > 0) {
    return res1[0];
  }

  // Looking for related structural directive.
  const prevNode = root?.nativeNode.previousSibling;
  const matches =
    !prevNode || prevNode.nodeName !== '#comment' || !root || !root.parent
      ? []
      : root.parent.queryAllNodes(node => node.nativeNode === prevNode);
  const matchedNode = matches[0];
  const res2 = funcGetFromNode([], matchedNode, getSourceOfMock(sel));
  if (res2.length > 0) {
    return res2[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find ${sel.name} instance via ngMocks.get`);
};

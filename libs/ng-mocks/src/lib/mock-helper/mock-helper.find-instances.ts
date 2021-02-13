import { Type } from '../common/core.types';
import { getSourceOfMock } from '../common/func.get-source-of-mock';
import { MockedDebugNode } from '../mock-render/types';

import funcGetFromNode from './func.get-from-node';
import funcGetLastFixture from './func.get-last-fixture';
import funcParseFindArgs from './func.parse-find-args';

interface DebugNode {
  childNodes?: MockedDebugNode[];
}

function nestedCheck<T>(result: T[], node: MockedDebugNode & DebugNode, proto: Type<T>) {
  funcGetFromNode(result, node, proto);
  for (const childNode of node?.childNodes || []) {
    nestedCheck(result, childNode, proto);
  }
}

export default <T>(...args: any[]): T[] => {
  const { el, sel } = funcParseFindArgs(args);
  const debugElement = el || funcGetLastFixture()?.debugElement;
  if (typeof sel !== 'function') {
    throw new Error('Only classes are accepted');
  }

  const result: T[] = [];
  nestedCheck(result, debugElement, getSourceOfMock(sel));

  return result;
};

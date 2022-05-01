import { DebugNode } from '@angular/core';

import { DebugNodeSelector } from '../../common/core.types';
import mockHelperFind from '../find/mock-helper.find';
import funcGetLastFixture from '../func.get-last-fixture';

import nestedCheck from './nested-check';

export default (
  sel: DebugNode | DebugNodeSelector,
  callback: (node: DebugNode, parent?: DebugNode) => void | boolean,
  includeTextNode = false,
): void => {
  const el = mockHelperFind(funcGetLastFixture(), sel, undefined);
  nestedCheck(el, undefined, callback, includeTextNode);
};

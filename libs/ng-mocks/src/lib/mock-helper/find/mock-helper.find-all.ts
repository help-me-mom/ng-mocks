import { DebugElement } from '@angular/core';

import isDebugNode from '../format/is-debug-node';

import funcParseFindArgs from './func.parse-find-args';
import funcParseFindTerm from './func.parse-find-term';

export default (...args: any[]): DebugElement[] => {
  const [el, sel] = funcParseFindArgs(args);
  if (isDebugNode(sel)) {
    return [sel as any];
  }

  return el?.queryAll(funcParseFindTerm(sel)) || [];
};

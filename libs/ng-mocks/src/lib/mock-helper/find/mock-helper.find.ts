import { DebugElement } from '@angular/core';

import isDebugNode from '../format/is-debug-node';
import funcParseFindArgsName from '../func.parse-find-args-name';

import funcParseFindArgs from './func.parse-find-args';
import funcParseFindTerm from './func.parse-find-term';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]): DebugElement => {
  const [el, sel, notFoundValue] = funcParseFindArgs(args, defaultNotFoundValue);
  const result = isDebugNode(sel) ? sel : el?.query(funcParseFindTerm(sel));
  if (result) {
    return result;
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find an element via ngMocks.find(${funcParseFindArgsName(sel)})`);
};

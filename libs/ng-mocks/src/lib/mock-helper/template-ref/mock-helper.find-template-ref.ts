import { TemplateRef } from '@angular/core';

import nestedCheck from '../crawl/nested-check';
import funcParseFindArgs from '../func.parse-find-args';
import funcParseFindArgsName from '../func.parse-find-args-name';

import detectCrawler from './detect-crawler';
import detectTemplateRef from './detect-template-ref';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]) => {
  const { el, sel, notFoundValue } = funcParseFindArgs(args, defaultNotFoundValue);

  const result: Array<TemplateRef<any>> = [];
  const detector = detectCrawler(sel);
  nestedCheck(el, detectTemplateRef(result, detector, 1));
  if (result.length) {
    return result[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }

  throw new Error(`Cannot find a TemplateRef via ngMocks.findTemplateRef(${funcParseFindArgsName(sel)})`);
};

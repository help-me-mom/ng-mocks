import { TemplateRef } from '@angular/core';

import nestedCheck from '../crawl/nested-check';
import mockHelperFind from '../find/mock-helper.find';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgs from '../func.parse-find-args';
import funcParseFindArgsName from '../func.parse-find-args-name';

import detectCrawler from './detect-crawler';
import detectTemplateRef from './detect-template-ref';
import funcIsValidTemplateRefSelector from './func.is-valid-template-ref-selector';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]) => {
  const [el, sel, notFoundValue] = funcParseFindArgs(args, funcIsValidTemplateRefSelector, defaultNotFoundValue);

  const result: Array<TemplateRef<any>> = [];
  const detector = detectCrawler(sel);
  nestedCheck(mockHelperFind(funcGetLastFixture(), el, undefined), undefined, detectTemplateRef(result, detector, 1));
  if (result.length > 0) {
    return result[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }

  throw new Error(`Cannot find a TemplateRef via ngMocks.findTemplateRef(${funcParseFindArgsName(sel)})`);
};

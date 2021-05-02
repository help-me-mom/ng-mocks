import { TemplateRef } from '@angular/core';

import nestedCheck from '../crawl/nested-check';
import mockHelperFind from '../find/mock-helper.find';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgs from '../func.parse-find-args';

import detectCrawler from './detect-crawler';
import detectTemplateRef from './detect-template-ref';
import funcIsValidTemplateRefSelector from './func.is-valid-template-ref-selector';

export default (...args: any[]): Array<TemplateRef<any>> => {
  const [el, sel] = funcParseFindArgs(args, funcIsValidTemplateRefSelector);

  const result: Array<TemplateRef<any>> = [];
  const detector = detectCrawler(sel);
  nestedCheck(mockHelperFind(funcGetLastFixture(), el, undefined), undefined, detectTemplateRef(result, detector));

  return result;
};

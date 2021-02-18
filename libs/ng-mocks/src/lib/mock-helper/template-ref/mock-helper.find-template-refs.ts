import { TemplateRef } from '@angular/core';

import nestedCheck from '../crawl/nested-check';
import funcParseFindArgs from '../func.parse-find-args';

import detectCrawler from './detect-crawler';
import detectTemplateRef from './detect-template-ref';

export default (...args: any[]): Array<TemplateRef<any>> => {
  const { el, sel } = funcParseFindArgs(args);

  const result: Array<TemplateRef<any>> = [];
  const detector = detectCrawler(sel);
  nestedCheck(el, detectTemplateRef(result, detector));

  return result;
};

import funcParseFindArgs from '../func.parse-find-args';

import detectCrawler from './detect-crawler';
import detectTextNode from './detect-text-node';
import nestedCheck from './nested-check';

export default (...args: any[]): any[] => {
  const { el, sel } = funcParseFindArgs(args);

  const detector = detectCrawler(sel);

  const result: any[] = [];
  nestedCheck(el, node => {
    if (!detectTextNode(node) && detector(node)) {
      result.push(node);
    }
  });

  return result;
};

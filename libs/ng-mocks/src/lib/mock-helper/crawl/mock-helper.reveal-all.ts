import funcParseFindArgs from '../func.parse-find-args';

import detectCrawler from './detect-crawler';
import detectTextNode from './detect-text-node';
import mockHelperCrawl from './mock-helper.crawl';

export default (...args: any[]): any[] => {
  const { el, sel } = funcParseFindArgs(args);

  const detector = detectCrawler(sel);

  const result: any[] = [];
  mockHelperCrawl(el, node => {
    if (node !== el && !detectTextNode(node) && detector(node)) {
      result.push(node);
    }
  });

  return result;
};

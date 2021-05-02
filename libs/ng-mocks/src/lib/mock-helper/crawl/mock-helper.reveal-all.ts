import mockHelperFind from '../find/mock-helper.find';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgs from '../func.parse-find-args';

import detectCrawler from './detect-crawler';
import detectTextNode from './detect-text-node';
import funcIsValidRevealSelector from './func.is-valid-reveal-selector';
import mockHelperCrawl from './mock-helper.crawl';

export default (...args: any[]): any[] => {
  const [el, sel] = funcParseFindArgs(args, funcIsValidRevealSelector);
  const root = mockHelperFind(funcGetLastFixture(), el, undefined);

  const detector = detectCrawler(sel);

  const result: any[] = [];
  mockHelperCrawl(root, node => {
    if (node !== root && !detectTextNode(node) && detector(node)) {
      result.push(node);
    }
  });

  return result;
};

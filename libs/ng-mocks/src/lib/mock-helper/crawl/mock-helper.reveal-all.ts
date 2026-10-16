import mockHelperFind from '../find/mock-helper.find';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgs from '../func.parse-find-args';

import funcCrawlRevealed from './func.crawl-revealed';
import funcIsValidRevealSelector from './func.is-valid-reveal-selector';

export default (...args: any[]): any[] => {
  const [el, sel] = funcParseFindArgs(args, funcIsValidRevealSelector);
  const root = mockHelperFind(funcGetLastFixture(), el, undefined);

  const result: any[] = [];
  funcCrawlRevealed(root, sel, node => {
    result.push(node);
  });

  return result;
};

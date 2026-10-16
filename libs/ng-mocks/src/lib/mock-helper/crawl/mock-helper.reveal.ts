import mockHelperFind from '../find/mock-helper.find';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgs from '../func.parse-find-args';
import funcParseFindArgsName from '../func.parse-find-args-name';

import funcCrawlRevealed from './func.crawl-revealed';
import funcIsValidRevealSelector from './func.is-valid-reveal-selector';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]): any => {
  const [el, sel, notFoundValue] = funcParseFindArgs(args, funcIsValidRevealSelector, defaultNotFoundValue);
  const root = mockHelperFind(funcGetLastFixture(), el, undefined);

  let result;
  funcCrawlRevealed(root, sel, node => {
    result = node;

    return true;
  });
  if (result) {
    return result;
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }

  throw new Error(`Cannot find a DebugElement via ngMocks.reveal(${funcParseFindArgsName(sel)})`);
};

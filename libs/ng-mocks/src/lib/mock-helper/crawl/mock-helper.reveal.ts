import mockHelperFind from '../find/mock-helper.find';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgs from '../func.parse-find-args';
import funcParseFindArgsName from '../func.parse-find-args-name';

import detectCrawler from './detect-crawler';
import detectTextNode from './detect-text-node';
import funcIsValidRevealSelector from './func.is-valid-reveal-selector';
import mockHelperCrawl from './mock-helper.crawl';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]): any => {
  const [el, sel, notFoundValue] = funcParseFindArgs(args, funcIsValidRevealSelector, defaultNotFoundValue);
  const root = mockHelperFind(funcGetLastFixture(), el, undefined);

  const detector = detectCrawler(sel);

  let result;
  mockHelperCrawl(root, node => {
    if (node !== root && !detectTextNode(node) && detector(node)) {
      result = node;

      return true;
    }

    return false;
  });
  if (result) {
    return result;
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }

  throw new Error(`Cannot find a DebugElement via ngMocks.reveal(${funcParseFindArgsName(sel)})`);
};

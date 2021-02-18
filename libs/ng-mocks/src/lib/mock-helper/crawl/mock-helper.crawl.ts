import funcParseFindArgs from '../func.parse-find-args';
import funcParseFindArgsName from '../func.parse-find-args-name';

import detectCrawler from './detect-crawler';
import detectTextNode from './detect-text-node';
import nestedCheck from './nested-check';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]): any => {
  const { el, sel, notFoundValue } = funcParseFindArgs(args, defaultNotFoundValue);

  const detector = detectCrawler(sel);

  let result;
  nestedCheck(el, node => {
    if (!detectTextNode(node) && detector(node)) {
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

import { getSourceOfMock } from '../common/func.get-source-of-mock';

import mockHelperCrawl from './crawl/mock-helper.crawl';
import funcGetFromNode from './func.get-from-node';
import funcParseFindArgs from './func.parse-find-args';
import funcParseFindArgsName from './func.parse-find-args-name';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]) => {
  const { el, sel, notFoundValue } = funcParseFindArgs(args, defaultNotFoundValue);
  if (typeof sel !== 'function') {
    throw new Error('Only classes are accepted');
  }

  const declaration = getSourceOfMock(sel);
  const result: any[] = [];
  mockHelperCrawl(
    el,
    node => {
      funcGetFromNode(result, node, declaration);

      return result.length > 0;
    },
    true,
  );
  if (result.length) {
    return result[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find an instance via ngMocks.findInstance(${funcParseFindArgsName(sel)})`);
};

import { getSourceOfMock } from '../common/func.get-source-of-mock';

import mockHelperCrawl from './crawl/mock-helper.crawl';
import funcGetFromNode from './func.get-from-node';
import funcParseFindArgs from './func.parse-find-args';

export default <T>(...args: any[]): T[] => {
  const { el, sel } = funcParseFindArgs(args);
  if (typeof sel !== 'function') {
    throw new Error('Only classes are accepted');
  }

  const declaration = getSourceOfMock(sel);
  const result: T[] = [];
  mockHelperCrawl(
    el,
    node => {
      funcGetFromNode(result, node, declaration);
    },
    true,
  );

  return result;
};

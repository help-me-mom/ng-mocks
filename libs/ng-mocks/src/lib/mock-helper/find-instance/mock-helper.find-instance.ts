import { getSourceOfMock } from '../../common/func.get-source-of-mock';
import { isNgDef } from '../../common/func.is-ng-def';
import mockHelperCrawl from '../crawl/mock-helper.crawl';
import mockHelperFind from '../find/mock-helper.find';
import funcGetFromNode from '../func.get-from-node';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgs from '../func.parse-find-args';
import funcParseFindArgsName from '../func.parse-find-args-name';
import { getInjection } from '../../common/core.helpers';
import { Type } from '../../common/core.types';

import funcIsValidFindInstanceSelector from './func.is-valid-find-instance-selector';

const defaultNotFoundValue = {}; // simulating Symbol

export default <T>(...args: any[]): T => {
  const [el, sel, notFoundValue] = funcParseFindArgs(args, funcIsValidFindInstanceSelector, defaultNotFoundValue);
  if (typeof sel !== 'function' && !isNgDef(sel, 't')) {
    throw new Error('Only classes or tokens are accepted');
  }

  const declaration: Type<T> = getSourceOfMock(sel);
  const result: T[] = [];
  const fixture = funcGetLastFixture();
  if (fixture) {
    mockHelperCrawl(
      mockHelperFind(fixture, el, undefined),
      (node, parent) => {
        funcGetFromNode(result, node, declaration);
        if (result.length === 0 && parent && parent.nativeNode.nodeName === '#comment') {
          funcGetFromNode(result, parent, declaration);
        }

        return result.length > 0;
      },
      true,
    );
  } else {
    try {
      result.push(getInjection(declaration));
    } catch {
      // nothing to do
    }
  }

  if (result.length > 0) {
    return result[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find an instance via ngMocks.findInstance(${funcParseFindArgsName(sel)})`);
};

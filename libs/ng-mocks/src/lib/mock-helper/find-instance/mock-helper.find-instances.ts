import { getSourceOfMock } from '../../common/func.get-source-of-mock';
import { isNgDef } from '../../common/func.is-ng-def';
import mockHelperCrawl from '../crawl/mock-helper.crawl';
import mockHelperFindAll from '../find/mock-helper.find-all';
import funcGetFromNode from '../func.get-from-node';
import funcGetLastFixture from '../func.get-last-fixture';
import funcParseFindArgs from '../func.parse-find-args';
import { getInjection } from '../../common/core.helpers';
import { Type } from '../../common/core.types';

import funcIsValidFindInstanceSelector from './func.is-valid-find-instance-selector';

export default <T>(...args: any[]): T[] => {
  const [el, sel] = funcParseFindArgs(args, funcIsValidFindInstanceSelector);
  if (typeof sel !== 'function' && !isNgDef(sel, 't') && typeof sel !== 'string') {
    throw new Error('Only classes or tokens are accepted');
  }

  const declaration: Type<T> = getSourceOfMock(sel);
  const result: T[] = [];
  const scanned: any[] = [];
  const fixture = funcGetLastFixture();
  if (fixture) {
    const elements = mockHelperFindAll(fixture, el, undefined);
    for (const element of elements) {
      mockHelperCrawl(
        element,
        (node, parent) => {
          if (scanned.indexOf(node) === -1) {
            funcGetFromNode(result, node, declaration);
            scanned.push(node);
          }
          if (parent && parent.nativeNode.nodeName === '#comment' && scanned.indexOf(parent) === -1) {
            funcGetFromNode(result, parent, declaration);
            scanned.push(parent);
          }
        },
        true,
      );
    }
  } else {
    try {
      result.push(getInjection(declaration));
    } catch {
      // nothing to do
    }
  }

  return result;
};

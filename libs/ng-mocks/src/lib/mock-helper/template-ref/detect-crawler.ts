import { Type } from '../../common/core.types';
import crawlByAttribute from '../crawl/crawl-by-attribute';
import crawlByAttributeValue from '../crawl/crawl-by-attribute-value';
import crawlByDeclaration from '../crawl/crawl-by-declaration';
import crawlById from '../crawl/crawl-by-id';

export default (selector: string | Type<any> | [string] | [string, any] | any) => {
  if (typeof selector === 'string') {
    return crawlById(selector);
  }
  if (Array.isArray(selector) && selector.length === 1 && typeof selector[0] === 'string') {
    return crawlByAttribute(selector[0]);
  }
  if (Array.isArray(selector) && selector.length === 2 && typeof selector[0] === 'string') {
    return crawlByAttributeValue(selector[0], selector[1]);
  }
  if (typeof selector === 'function') {
    return crawlByDeclaration(selector);
  }

  throw new Error('Unknown selector');
};

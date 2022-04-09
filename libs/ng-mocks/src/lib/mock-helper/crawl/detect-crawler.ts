import { AnyType } from '../../common/core.types';
import { MockedDebugNode } from '../../mock-render/types';

import crawlByAttribute from './crawl-by-attribute';
import crawlByAttributeValue from './crawl-by-attribute-value';
import crawlByDeclaration from './crawl-by-declaration';
import crawlById from './crawl-by-id';
import crawlByTagName from './crawl-by-tag-name';

type SELECTOR = string | AnyType<any> | [any] | [any, any];

const isCrawlByAttribute = (selector: SELECTOR): selector is [string] => {
  return Array.isArray(selector) && selector.length === 1 && typeof selector[0] === 'string';
};

const isCrawlByAttributeValue = (selector: SELECTOR): selector is [string, any] => {
  return Array.isArray(selector) && selector.length === 2 && typeof selector[0] === 'string';
};

const isCrawlById = (selector: SELECTOR): selector is string => {
  return typeof selector === 'string' && selector.indexOf('#') === 0 && selector.length > 1;
};

const isCrawlByTagName = (selector: SELECTOR): selector is string => {
  return typeof selector === 'string' && selector.indexOf('#') !== 0 && selector.length > 0;
};

const isCrawlByDeclaration = (selector: SELECTOR): selector is AnyType<any> => {
  return typeof selector === 'function';
};

export default (selector: SELECTOR): ((node: MockedDebugNode) => boolean) => {
  if (isCrawlByAttribute(selector)) {
    return crawlByAttribute(selector[0]);
  }
  if (isCrawlByAttributeValue(selector)) {
    return crawlByAttributeValue(selector[0], selector[1]);
  }
  if (isCrawlById(selector)) {
    return crawlById(selector.slice(1));
  }
  if (isCrawlByTagName(selector)) {
    return crawlByTagName(selector);
  }
  if (isCrawlByDeclaration(selector)) {
    return crawlByDeclaration(selector);
  }

  throw new Error('Unknown selector');
};

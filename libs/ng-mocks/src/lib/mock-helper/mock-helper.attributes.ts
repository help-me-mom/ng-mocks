import { DirectiveIo } from '../common/core.types';
import funcDirectiveIoParse from '../common/func.directive-io-parse';
import { MockedDebugElement } from '../mock-render/types';

import mockHelperFind from './find/mock-helper.find';
import funcGetLastFixture from './func.get-last-fixture';
import funcParseProviderTokensDirectives from './func.parse-provider-tokens-directives';
import mockHelperGet from './mock-helper.get';

const defaultNotFoundValue = {}; // simulating Symbol

const parseArgs = (args: any[]): [MockedDebugElement | null | undefined, string, any] => [
  args[0],
  args[1],
  args.length === 3 ? args[2] : defaultNotFoundValue,
];

const attrMatches = (attribute: DirectiveIo, selector: string): string | undefined => {
  const { name, alias = '' } = funcDirectiveIoParse(attribute);

  if ((!alias && name === selector) || (!!alias && alias === selector)) {
    return name;
  }

  return undefined;
};

const detectAttribute = (el: MockedDebugElement | null | undefined, attr: 'inputs' | 'outputs', sel: string) => {
  for (const token of el?.providerTokens || []) {
    const meta = funcParseProviderTokensDirectives(el, token);
    if (!meta) {
      continue;
    }

    for (const attrDef of meta[attr] || /* istanbul ignore next */ []) {
      const prop = attrMatches(attrDef, sel);
      if (prop) {
        return mockHelperGet(el, token)[prop];
      }
    }
  }

  throw new Error('Not found');
};

export default (label: string, attr: 'inputs' | 'outputs', ...args: any[]) => {
  const [el, sel, notFoundValue] = parseArgs(args);

  try {
    return detectAttribute(mockHelperFind(funcGetLastFixture(), el, undefined), attr, sel);
  } catch {
    // nothing to do
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find ${sel} ${label} via ngMocks.${label}`);
};

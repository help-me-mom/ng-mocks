import { Directive } from '@angular/core';

import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import { MockedDebugElement } from '../mock-render/types';

import mockHelperGet from './mock-helper.get';

const defaultNotFoundValue = {}; // simulating Symbol

const parseArgs = (args: any[]): [MockedDebugElement, string, any] => [
  args[0],
  args[1],
  args.length === 3 ? args[2] : defaultNotFoundValue,
];

const getMeta = (token: any): Directive | undefined => {
  try {
    return coreReflectDirectiveResolve(token);
  } catch (e) {
    // Looks like it is a token.
  }

  return undefined;
};

export default (label: string, attr: 'inputs' | 'outputs', ...args: any[]) => {
  const [el, sel, notFoundValue] = parseArgs(args);

  for (const token of el.providerTokens) {
    const meta = getMeta(token);
    if (!meta) {
      continue;
    }

    // istanbul ignore if
    for (const attrDef of meta[attr] || /* istanbul ignore next */ []) {
      const [prop, alias = ''] = attrDef.split(':', 2).map(v => v.trim());
      if ((!alias && prop !== sel) || (alias && alias !== sel)) {
        continue;
      }

      return mockHelperGet(el, token)[prop];
    }
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find ${sel} ${label} via ngMocks.${label}`);
};

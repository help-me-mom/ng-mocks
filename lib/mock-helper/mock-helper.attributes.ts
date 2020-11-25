import coreReflectDirectiveResolve from '../common/core.reflect.directive-resolve';
import { MockedDebugElement } from '../mock-render/types';

import mockHelperGet from './mock-helper.get';

const defaultNotFoundValue = {}; // simulating Symbol

export default (label: string, attr: 'inputs' | 'outputs', ...args: any[]) => {
  const el: MockedDebugElement = args[0];
  const sel: string = args[1];
  const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;

  for (const token of el.providerTokens) {
    const meta = coreReflectDirectiveResolve(token);

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

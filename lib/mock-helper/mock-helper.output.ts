import { core } from '@angular/compiler';

import { directiveResolver } from '../common/core.reflect';
import { MockedDebugElement } from '../mock-render/types';

import get from './mock-helper.get';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]) => {
  const el: MockedDebugElement = args[0];
  const sel: string = args[1];
  const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;

  for (const token of el.providerTokens) {
    let meta: core.Directive;
    try {
      meta = directiveResolver.resolve(token);
    } catch (e) {
      /* istanbul ignore next */
      throw new Error('ng-mocks is not in JIT mode and cannot resolve declarations');
    }

    const { outputs } = meta;
    /* istanbul ignore if */
    if (!outputs) {
      continue;
    }
    for (const outputDef of outputs) {
      const [prop, alias = ''] = outputDef.split(':', 2).map(v => v.trim());
      if (!alias && prop !== sel) {
        continue;
      }
      if (alias && alias !== sel) {
        continue;
      }
      const directive: any = get(el, token);
      return directive[prop];
    }
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find ${sel} output via ngMocks.output`);
};

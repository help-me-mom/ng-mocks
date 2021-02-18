import { TemplateRef } from '@angular/core';

import { MockedDebugNode } from '../../mock-render/types';
import detectTextNode from '../crawl/detect-text-node';

export default (
  result: Array<TemplateRef<any>>,
  detector: (node: MockedDebugNode) => boolean,
  limit = 0,
): ((node: MockedDebugNode) => boolean) => node => {
  try {
    const instance = !detectTextNode(node) && detector(node) ? node.injector.get(TemplateRef) : undefined;
    if (instance) {
      result.push(instance);
    }
  } catch (e) {
    // nothing to do
  }

  return !!limit && result.length === limit;
};

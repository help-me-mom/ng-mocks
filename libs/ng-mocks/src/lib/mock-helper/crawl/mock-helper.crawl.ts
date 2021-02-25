import { DebugNode } from '@angular/core';

import nestedCheck from './nested-check';

export default (
  el: DebugNode | undefined,
  callback: (node: DebugNode) => void | boolean,
  includeTextNode = false,
): void => {
  nestedCheck(el, undefined, callback, includeTextNode);
};

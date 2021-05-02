import { DebugElement } from '@angular/core';

import funcParseFindArgs from './func.parse-find-args';
import funcParseFindTerm from './func.parse-find-term';

export default (...args: any[]): DebugElement[] => {
  const [el, sel] = funcParseFindArgs(args);

  return el?.queryAll(funcParseFindTerm(sel)) || [];
};

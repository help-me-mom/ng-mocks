import { By } from '@angular/platform-browser';

import { getSourceOfMock } from '../common/func.get-source-of-mock';

import funcGetLastFixture from './func.get-last-fixture';
import funcParseFindArgs from './func.parse-find-args';

export default (...args: any[]) => {
  const { el, sel } = funcParseFindArgs(args);
  const debugElement = el || funcGetLastFixture()?.debugElement;

  const term = typeof sel === 'string' ? By.css(sel) : By.directive(getSourceOfMock(sel));

  return debugElement?.queryAll(term) || [];
};

import { By } from '@angular/platform-browser';

import { getSourceOfMock } from '../common/func.get-source-of-mock';

import funcGetLastFixture from './func.get-last-fixture';
import funcParseFindArgs from './func.parse-find-args';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]) => {
  const { el, sel, notFoundValue } = funcParseFindArgs(args, defaultNotFoundValue);
  const debugElement = el || funcGetLastFixture()?.debugElement;

  const term = typeof sel === 'string' ? By.css(sel) : By.directive(getSourceOfMock(sel));
  const result = debugElement?.query(term);
  if (result) {
    return result;
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find an element via ngMocks.find(${typeof sel === 'string' ? sel : sel.name})`);
};

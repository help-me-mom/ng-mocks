// tslint:disable:no-default-export

import { By } from '@angular/platform-browser';

import { getSourceOfMock, Type } from '../common';
import { MockedDebugElement } from '../mock-render';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]) => {
  const el: MockedDebugElement = args[0];
  const sel: string | Type<any> = args[1];
  const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;

  const term = typeof sel === 'string' ? By.css(sel) : By.directive(getSourceOfMock(sel));
  const result = el.query(term);
  if (result) {
    return result;
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find an element via ngMocks.find(${typeof sel === 'string' ? sel : sel.name})`);
};

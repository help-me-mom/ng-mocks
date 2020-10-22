// tslint:disable:no-default-export

import { By } from '@angular/platform-browser';

import { getSourceOfMock } from '../common';
import { MockedDebugElement } from '../mock-render';

export default (el: MockedDebugElement, sel: any) => {
  const term = typeof sel === 'string' ? By.css(sel) : By.directive(getSourceOfMock(sel));
  return el.queryAll(term);
};

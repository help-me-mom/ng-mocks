// tslint:disable:no-default-export

import { By } from '@angular/platform-browser';

import { getSourceOfMock } from '../common';

export default (el: any, sel: any) => {
  const term = typeof sel === 'string' ? By.css(sel) : By.directive(getSourceOfMock(sel));
  return (el.debugElement ? el.debugElement : el).queryAll(term);
};

import { By } from '@angular/platform-browser';

import { getSourceOfMock } from '../common/func.get-source-of-mock';

export default (el: any, sel: any) => {
  const term = typeof sel === 'string' ? By.css(sel) : By.directive(getSourceOfMock(sel));
  return (el.debugElement ? el.debugElement : el).queryAll(term);
};

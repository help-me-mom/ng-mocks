import { By } from '@angular/platform-browser';

import { Type } from '../common/core.types';
import { getSourceOfMock } from '../common/func.get-source-of-mock';
import { MockedDebugElement } from '../mock-render/types';

import getLastFixture from './func.get-last-fixture';

export default (...args: any[]) => {
  const el: undefined | MockedDebugElement =
    typeof args[0] !== 'object' ? undefined : args[0].debugElement ? args[0].debugElement : args[0];
  const sel: string | Type<any> = el ? args[1] : args[0];

  const debugElement = el || getLastFixture()?.debugElement;

  const term = typeof sel === 'string' ? By.css(sel) : By.directive(getSourceOfMock(sel));
  return debugElement?.queryAll(term) || [];
};

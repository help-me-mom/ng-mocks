import { DebugElement, Predicate } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AnyType } from '../../common/core.types';
import { getSourceOfMock } from '../../common/func.get-source-of-mock';

export default (selector: string | AnyType<any> | [string] | [string, any]): Predicate<DebugElement> => {
  return Array.isArray(selector)
    ? By.css(selector.length === 1 ? `[${selector[0]}]` : `[${selector[0]}="${selector[1]}"]`)
    : typeof selector === 'string'
      ? By.css(selector)
      : By.directive(getSourceOfMock(selector));
};

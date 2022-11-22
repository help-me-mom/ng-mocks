import { DebugElement } from '@angular/core';

import isFixture from '../format/is-fixture';
import funcGetLastFixture from '../func.get-last-fixture';

const findDebugElement = (el: any): DebugElement | undefined => {
  if (isFixture(el)) {
    return findDebugElement(el.debugElement);
  }
  if (el && el.injector && el.query) {
    return el;
  }

  return undefined;
};

export default (args: any[], defaultNotFoundValue?: any): [any, any, any] => {
  let el;
  let sel;
  let notFoundValue = defaultNotFoundValue;
  if (args.length === 3) {
    el = findDebugElement(args[0]);
    sel = args[1];
    notFoundValue = args[2];
  } else if (args.length === 1) {
    el = findDebugElement(funcGetLastFixture());
    [sel] = args;
  } else if (args[0]) {
    el = findDebugElement(args[0]);
    if (el) {
      sel = args[1];
    } else {
      el = findDebugElement(funcGetLastFixture());
      [sel, notFoundValue] = args;
    }
  } else {
    sel = args[1];
  }
  sel = findDebugElement(sel) ?? sel;

  return [el, sel, notFoundValue];
};

// tslint:disable:no-default-export no-default-import

import { getSourceOfMock, Type } from '../common';
import { MockedDebugElement } from '../mock-render';

import findInstances from './mock-helper.findInstances';

const defaultNotFoundValue = {}; // simulating Symbol

export default <T>(...args: any[]) => {
  const el: MockedDebugElement = args[0];
  const sel: Type<T> = args[1];
  const notFoundValue: any = args.length === 3 ? args[2] : defaultNotFoundValue;

  const result = findInstances(el, getSourceOfMock(sel));
  if (result.length) {
    return result[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find ${sel.name} directive via ngMocks.findInstance`);
};

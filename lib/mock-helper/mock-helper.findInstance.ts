import { Type } from '../common/core.types';
import { getSourceOfMock } from '../common/func.get-source-of-mock';

import funcGetLastFixture from './func.get-last-fixture';
import funcParseFindArgs from './func.parseFindArgs';
import mockHelperFindInstances from './mock-helper.findInstances';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]) => {
  const { el, sel, notFoundValue } = funcParseFindArgs<Type<any>>(args, defaultNotFoundValue);
  const debugElement = el || funcGetLastFixture()?.debugElement;

  const result = mockHelperFindInstances(debugElement, getSourceOfMock(sel));
  if (result.length) {
    return result[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find an instance via ngMocks.findInstance(${sel.name})`);
};

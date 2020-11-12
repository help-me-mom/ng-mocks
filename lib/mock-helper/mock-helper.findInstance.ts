import { Type } from '../common/core.types';
import { getSourceOfMock } from '../common/func.get-source-of-mock';
import { MockedDebugElement } from '../mock-render/types';

import getLastFixture from './func.get-last-fixture';
import findInstances from './mock-helper.findInstances';

const defaultNotFoundValue = {}; // simulating Symbol

export default <T>(...args: any[]) => {
  const el: undefined | MockedDebugElement =
    typeof args[0] !== 'object' ? undefined : args[0].debugElement ? args[0].debugElement : args[0];
  const sel: Type<any> = el ? args[1] : args[0];
  const notFoundValue: any =
    el && args.length === 3 ? args[2] : !el && args.length === 2 ? args[1] : defaultNotFoundValue;

  const debugElement = el || getLastFixture()?.debugElement;

  const result = findInstances(debugElement, getSourceOfMock(sel));
  if (result.length) {
    return result[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find an instance via ngMocks.findInstance(${sel.name})`);
};

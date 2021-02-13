import funcGetLastFixture from './func.get-last-fixture';
import funcParseFindArgs from './func.parse-find-args';
import funcParseFindArgsName from './func.parse-find-args-name';
import mockHelperFindInstances from './mock-helper.find-instances';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]) => {
  const { el, sel, notFoundValue } = funcParseFindArgs(args, defaultNotFoundValue);
  const debugElement = el || funcGetLastFixture()?.debugElement;

  const result = mockHelperFindInstances(debugElement, sel);
  if (result.length) {
    return result[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }
  throw new Error(`Cannot find an instance via ngMocks.findInstance(${funcParseFindArgsName(sel)})`);
};

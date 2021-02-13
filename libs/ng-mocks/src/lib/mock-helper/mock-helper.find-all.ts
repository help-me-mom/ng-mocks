import funcGetLastFixture from './func.get-last-fixture';
import funcParseFindArgs from './func.parse-find-args';
import funcParseFindTerm from './func.parse-find-term';

export default (...args: any[]) => {
  const { el, sel } = funcParseFindArgs(args);
  const debugElement = el || funcGetLastFixture()?.debugElement;

  return debugElement?.queryAll(funcParseFindTerm(sel)) || [];
};

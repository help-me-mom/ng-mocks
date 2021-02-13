import funcParseFindArgs from './func.parse-find-args';
import funcParseFindTerm from './func.parse-find-term';

export default (...args: any[]) => {
  const { el, sel } = funcParseFindArgs(args);

  return el?.queryAll(funcParseFindTerm(sel)) || [];
};

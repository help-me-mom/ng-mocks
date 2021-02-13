import funcParseFindArgs from './func.parse-find-args';
import funcParseFindArgsName from './func.parse-find-args-name';
import mockHelperFindTemplateRefs from './mock-helper.find-template-refs';

const defaultNotFoundValue = {}; // simulating Symbol

export default (...args: any[]) => {
  const { el, sel, notFoundValue } = funcParseFindArgs(args, defaultNotFoundValue);

  const result = el ? mockHelperFindTemplateRefs(el, sel) : [];
  if (result.length) {
    return result[0];
  }
  if (notFoundValue !== defaultNotFoundValue) {
    return notFoundValue;
  }

  throw new Error(`Cannot find a TemplateRef via ngMocks.findTemplateRef(${funcParseFindArgsName(sel)})`);
};

import isDebugNode from './format/is-debug-node';
import isFixture from './format/is-fixture';
import funcGetLastFixture from './func.get-last-fixture';

const isSelector = (value: any): boolean => {
  if (typeof value === 'string') {
    return true;
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return true;
  }
  if (isFixture(value)) {
    return true;
  }
  if (isDebugNode(value)) {
    return true;
  }

  return true;
};

export default (args: any[], isValidValue: (value: any) => boolean, defaultNotFoundValue?: any): [any, any, any] => {
  let el;
  let sel;
  let notFoundValue = defaultNotFoundValue;
  if (args.length === 3) {
    [el, sel, notFoundValue] = args;
  } else if (args.length === 1) {
    el = funcGetLastFixture();
    [sel] = args;
  } else if (isValidValue(args[1]) && isSelector(args[0])) {
    [el, sel] = args;
  } else {
    el = funcGetLastFixture();
    [sel, notFoundValue] = args;
  }

  return [el, sel, notFoundValue];
};

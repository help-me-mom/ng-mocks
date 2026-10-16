import funcGetLastFixture from './func.get-last-fixture';

export default (args: any[], isValidValue: (value: any) => boolean, defaultNotFoundValue?: any): [any, any, any] => {
  let el;
  let sel;
  let notFoundValue = defaultNotFoundValue;
  if (args.length === 3) {
    [el, sel, notFoundValue] = args;
  } else if (args.length === 1) {
    el = funcGetLastFixture();
    [sel] = args;
  } else if (isValidValue(args[1])) {
    [el, sel] = args;
  } else {
    el = funcGetLastFixture();
    [sel, notFoundValue] = args;
  }

  return [el, sel, notFoundValue];
};

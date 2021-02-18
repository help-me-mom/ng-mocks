import { AnyType } from '../common/core.types';
import funcGetLastFixture from '../mock-helper/func.get-last-fixture';
import { MockedDebugElement } from '../mock-render/types';

const detectEl = (args: any[]): undefined | MockedDebugElement => {
  return Array.isArray(args[0]) || typeof args[0] !== 'object'
    ? undefined
    : args[0]?.debugElement
    ? args[0].debugElement
    : args[0];
};

const detectSel = (args: any[], el: any) => {
  return el || !args[0] ? args[1] : args[0];
};

const detectNotFound = (args: any[], el: any, defaultNotFoundValue: any): any => {
  return args.length === 3 ? args[2] : !el && args[0] && args.length === 2 ? args[1] : defaultNotFoundValue;
};

export default (
  args: any[],
  defaultNotFoundValue?: any,
): {
  el: undefined | MockedDebugElement;
  notFoundValue: any;
  sel: string | AnyType<any> | [string] | [string, any];
} => {
  const el = detectEl(args);
  const sel = detectSel(args, el);
  const notFoundValue = detectNotFound(args, el, defaultNotFoundValue);

  return {
    el: el ?? (args[0] && funcGetLastFixture()?.debugElement) ?? undefined,
    notFoundValue,
    sel,
  };
};

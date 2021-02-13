import { Type } from '../common/core.types';
import { MockedDebugElement } from '../mock-render/types';

export default (
  args: any[],
  defaultNotFoundValue?: any,
): {
  el: undefined | MockedDebugElement;
  notFoundValue: any;
  sel: string | Type<any> | [string] | [string, any];
} => {
  const el: undefined | MockedDebugElement =
    Array.isArray(args[0]) || typeof args[0] !== 'object'
      ? undefined
      : args[0].debugElement
      ? args[0].debugElement
      : args[0];
  const sel = el || !args[0] ? args[1] : args[0];
  const notFoundValue: any =
    el && args.length === 3 ? args[2] : !el && args.length === 2 ? args[1] : defaultNotFoundValue;

  return {
    el,
    notFoundValue,
    sel,
  };
};

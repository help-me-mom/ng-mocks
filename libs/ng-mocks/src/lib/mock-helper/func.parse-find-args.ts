import { Type } from '../common/core.types';
import { MockedDebugElement } from '../mock-render/types';

export default <T = string | Type<any>>(
  args: any[],
  defaultNotFoundValue?: any,
): {
  el: undefined | MockedDebugElement;
  notFoundValue: any;
  sel: T;
} => {
  const el: undefined | MockedDebugElement =
    typeof args[0] !== 'object' ? undefined : args[0].debugElement ? args[0].debugElement : args[0];
  const sel: T = el ? args[1] : args[0];
  const notFoundValue: any =
    el && args.length === 3 ? args[2] : !el && args.length === 2 ? args[1] : defaultNotFoundValue;

  return {
    el,
    notFoundValue,
    sel,
  };
};

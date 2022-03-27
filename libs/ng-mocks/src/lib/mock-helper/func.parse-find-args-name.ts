import { AnyType, DebugNodeSelector } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';

export default (selector: AnyType<any> | DebugNodeSelector): string => {
  if (typeof selector === 'string') {
    return selector;
  }
  if (typeof selector === 'function') {
    return selector.name;
  }
  if (isNgDef(selector, 't')) {
    return (selector as any)._desc;
  }
  if (Array.isArray(selector)) {
    return selector[0];
  }
  if (!selector) {
    return '<EMPTY>';
  }

  return '<UNKNOWN>';
};

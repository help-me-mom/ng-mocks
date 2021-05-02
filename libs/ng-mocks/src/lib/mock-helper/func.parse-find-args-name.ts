import { AnyType, DebugNodeSelector } from '../common/core.types';

export default (selector: AnyType<any> | DebugNodeSelector): string => {
  if (typeof selector === 'string') {
    return selector;
  }
  if (typeof selector === 'function') {
    return selector.name;
  }
  if (Array.isArray(selector)) {
    return selector[0];
  }
  if (!selector) {
    return '<EMPTY>';
  }

  return '<UNKNOWN>';
};

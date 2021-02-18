import { AnyType } from '../common/core.types';

export default (selector: string | AnyType<any> | [string] | [string, any]): string => {
  if (typeof selector === 'string') {
    return selector;
  }
  if (typeof selector === 'function') {
    return selector.name;
  }

  return selector[0];
};

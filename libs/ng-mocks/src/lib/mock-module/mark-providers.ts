import { flatten } from '../common/core.helpers';
import funcGetType from '../common/func.get-type';
import markExported from '../mock/mark-exported';

export default (providers?: any[]): void => {
  for (const provider of flatten(providers ?? [])) {
    const instance = funcGetType(provider);
    markExported(instance);
  }
};

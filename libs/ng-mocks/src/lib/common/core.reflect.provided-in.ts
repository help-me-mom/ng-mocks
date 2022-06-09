import { AnyType } from './core.types';

export default (declaration: any): undefined | AnyType<any> | string => {
  if (!declaration || (typeof declaration !== 'object' && typeof declaration !== 'function')) {
    return undefined;
  }

  return declaration.ɵprov?.providedIn ?? declaration.ngInjectableDef?.providedIn;
};

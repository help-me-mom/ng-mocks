import { AnyType } from './core.types';

export default (declaration: any): undefined | AnyType<any> | string => {
  return declaration?.ɵprov?.providedIn ?? declaration?.ngInjectableDef?.providedIn;
};

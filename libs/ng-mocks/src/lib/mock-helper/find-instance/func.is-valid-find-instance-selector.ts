import { isNgDef } from '../../common/func.is-ng-def';

export default (value: any): boolean => {
  return typeof value === 'function' || isNgDef(value, 't');
};

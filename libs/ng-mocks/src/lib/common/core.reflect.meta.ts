import coreReflectDirectiveResolve from './core.reflect.directive-resolve';
import coreReflectModuleResolve from './core.reflect.module-resolve';
import { isNgDef } from './func.is-ng-def';

export default (value: any): any => {
  if (isNgDef(value, 'c')) {
    return coreReflectDirectiveResolve(value);
  }
  if (isNgDef(value, 'd')) {
    return coreReflectDirectiveResolve(value);
  }
  if (isNgDef(value, 'm')) {
    return coreReflectModuleResolve(value);
  }

  return undefined;
};

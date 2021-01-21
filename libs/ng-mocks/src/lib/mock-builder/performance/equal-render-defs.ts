import equalVariables from './equal-variables';

export default (prototype: any, source: any): boolean => {
  if (prototype === source) {
    return true;
  }
  if ((typeof prototype === 'boolean' || typeof source === 'boolean') && prototype !== source) {
    return false;
  }

  return prototype.$implicit === source.$implicit && equalVariables(prototype.variables, source.variables);
};

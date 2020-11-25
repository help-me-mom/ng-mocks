import equalVariables from './equal-variables';

export default (prototype: any, source: any): boolean => {
  if (prototype === source) {
    return true;
  }
  if ((typeof prototype === 'boolean' || typeof source === 'boolean') && prototype !== source) {
    return false;
  }
  if (prototype.$implicit !== source.$implicit) {
    return false;
  }
  if (!equalVariables(prototype.variables, source.variables)) {
    return false;
  }

  return true;
};

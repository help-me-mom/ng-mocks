export default (value: any): string => {
  if (typeof value === 'function' && value.name) {
    return value.name;
  }
  if (typeof value === 'function') {
    return 'arrow-function';
  }
  if (typeof value === 'object' && value && value.ngMetadataName === 'InjectionToken') {
    return value._desc;
  }
  if (typeof value === 'object' && value && typeof value.constructor === 'function') {
    return value.constructor.name;
  }

  return 'unknown';
};

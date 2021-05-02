export default (value: any): boolean => {
  if (typeof value === 'string') {
    return true;
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return true;
  }
  if (typeof value === 'function') {
    return true;
  }

  return false;
};

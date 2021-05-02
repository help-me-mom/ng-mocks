export default (value: any) => {
  if (typeof value === 'string') {
    return true;
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return true;
  }

  return typeof value === 'function';
};

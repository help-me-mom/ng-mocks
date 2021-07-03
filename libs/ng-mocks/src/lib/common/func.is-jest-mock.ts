export default (def: any): boolean => {
  if (!def) {
    return false;
  }

  if (typeof def !== 'function' && typeof def !== 'object') {
    return false;
  }

  if (def._isMockFunction && def.mockName && def.__annotations__) {
    return true;
  }

  return false;
};

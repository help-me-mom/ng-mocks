export default (prototype: any, source: any): boolean => {
  if (prototype === source) {
    return true;
  }
  if (prototype && !source) {
    return false;
  }
  if (!prototype && source) {
    return false;
  }
  const prototypeKeys = Object.keys(prototype);
  const sourceKeys = Object.keys(source);
  if (prototypeKeys.length !== sourceKeys.length) {
    return false;
  }
  for (const key of prototypeKeys) {
    if (prototype[key] !== source[key]) {
      return false;
    }
  }

  return true;
};

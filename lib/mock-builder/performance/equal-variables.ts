const objectsDiffer = (prototype: any, source: any): boolean => {
  const prototypeKeys = Object.keys(prototype);
  const sourceKeys = Object.keys(source);
  if (prototypeKeys.length !== sourceKeys.length) {
    return true;
  }
  for (const key of prototypeKeys) {
    if (prototype[key] !== source[key]) {
      return true;
    }
  }

  return false;
};

export default (prototype: any, source: any): boolean => {
  if (prototype === source) {
    return true;
  }
  if ((prototype && !source) || (!prototype && source)) {
    return false;
  }
  if (objectsDiffer(prototype, source)) {
    return false;
  }

  return true;
};

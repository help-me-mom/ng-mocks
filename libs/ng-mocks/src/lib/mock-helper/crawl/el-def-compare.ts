export default (a: any, b: any): boolean => {
  if (!a || !b) {
    return false;
  }

  return a === b;
};

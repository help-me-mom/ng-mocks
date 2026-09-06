export default (source: Set<any>, destination: Set<any>): boolean => {
  if (!destination || destination.size !== source.size) {
    return false;
  }
  for (const value of source) {
    if (!destination.has(value)) {
      return false;
    }
  }

  return true;
};

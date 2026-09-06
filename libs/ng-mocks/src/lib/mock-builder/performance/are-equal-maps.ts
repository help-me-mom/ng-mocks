const equal = (a: any, b: any) => a === b;

export default (source: Map<any, any>, destination: Map<any, any>, compare = equal): boolean => {
  if (!destination || destination.size !== source.size) {
    return false;
  }
  for (const value of source.keys()) {
    if (!destination.has(value)) {
      return false;
    }
    if (!compare(destination.get(value), source.get(value))) {
      return false;
    }
  }

  return true;
};

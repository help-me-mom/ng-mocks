import { mapKeys } from '../../common/core.helpers';

export default (source: Map<any, any>, destination: Map<any, any>, compare = (a: any, b: any) => a === b): boolean => {
  if (!destination || destination.size !== source.size) {
    return false;
  }
  for (const value of mapKeys(source)) {
    if (!destination.has(value)) {
      return false;
    }
    if (!compare(destination.get(value), source.get(value))) {
      return false;
    }
  }

  return true;
};

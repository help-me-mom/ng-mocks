import { mapValues } from '../../common/core.helpers';

export default (source: Set<any>, destination: Set<any>): boolean => {
  if (!destination || destination.size !== source.size) {
    return false;
  }
  for (const value of mapValues(source)) {
    if (!destination.has(value)) {
      return false;
    }
  }

  return true;
};

import { mapKeys } from '../../common/core.helpers';

import areEqualProviders from './are-equal-providers';

export default (source: any, destination: any): boolean => {
  if (!destination || destination.size !== source.size) {
    return false;
  }
  for (const value of mapKeys(source)) {
    if (!destination.has(value)) {
      return false;
    }
    if (!areEqualProviders(destination.get(value), source.get(value))) {
      return false;
    }
  }

  return true;
};

import { InjectionToken } from '@angular/core';

import { mapKeys } from '../../common/core.helpers';
import { Type } from '../../common/core.types';

import areEqualConfigParams from './are-equal-config-params';

export default (
  source: Map<Type<any> | InjectionToken<any>, any>,
  destination: Map<Type<any> | InjectionToken<any>, any>,
): boolean => {
  if (!destination || destination.size !== source.size) {
    return false;
  }
  for (const value of mapKeys(source)) {
    if (!destination.has(value)) {
      return false;
    }
    if (!areEqualConfigParams(source.get(value), destination.get(value))) {
      return false;
    }
  }

  return true;
};
